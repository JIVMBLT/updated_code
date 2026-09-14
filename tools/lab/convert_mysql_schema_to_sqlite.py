#!/usr/bin/env python3
"""Gestor Mantto LAB DGB: convert MySQL table DDL to SQLite-compatible DDL.

LAB ONLY. This tool never connects to Aiven or another database. It reads a
local schema dump and writes a local SQLite schema file.
"""
from __future__ import annotations

import argparse
import pathlib
import re


def split_top_level_commas(text: str) -> list[str]:
    output: list[str] = []
    current: list[str] = []
    depth = 0
    quote = None
    escaped = False
    for char in text:
        if quote:
            current.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
            continue
        if char in "'\"":
            quote = char
            current.append(char)
            continue
        if char == '(':
            depth += 1
        elif char == ')' and depth:
            depth -= 1
        if char == ',' and depth == 0:
            output.append(''.join(current).strip())
            current = []
        else:
            current.append(char)
    remainder = ''.join(current).strip()
    if remainder:
        output.append(remainder)
    return output


def strip_comment_clause(value: str) -> str:
    match = re.search(r"\s+COMMENT\s+'(?:''|\\'|[^'])*'\s*$", value, flags=re.I | re.S)
    return value[:match.start()].rstrip() if match else value


def normalize_ident_list(value: str) -> str:
    return re.sub(r'(`[^`]+`)\s*\(\d+\)', r'\1', value)


def extract_type(value: str) -> tuple[str, str]:
    depth = 0
    quote = None
    escaped = False
    index = 0
    while index < len(value):
        char = value[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
        else:
            if char in "'\"":
                quote = char
            elif char == '(':
                depth += 1
            elif char == ')':
                depth = max(0, depth - 1)
            elif char.isspace() and depth == 0:
                break
        index += 1
    return value[:index], value[index:].lstrip()


def map_type(mysql_type: str) -> str:
    base_match = re.match(r'[a-z]+', mysql_type.strip().lower())
    base = base_match.group(0) if base_match else mysql_type.strip().lower()
    if base in {'bigint', 'int', 'integer', 'smallint', 'mediumint', 'tinyint', 'year', 'bit'}:
        return 'INTEGER'
    if base in {'decimal', 'numeric', 'float', 'double', 'real'}:
        return 'REAL'
    if base in {'blob', 'tinyblob', 'mediumblob', 'longblob', 'binary', 'varbinary'}:
        return 'BLOB'
    return 'TEXT'


def convert_column(item: str, auto_pk_cols: set[str]) -> str:
    match = re.match(r'`([^`]+)`\s+(.+)$', item, re.S)
    if not match:
        raise ValueError(f'Invalid column definition: {item}')
    name, rest = match.group(1), strip_comment_clause(match.group(2).strip())
    mysql_type, attrs = extract_type(rest)
    attrs = re.sub(r'\bUNSIGNED\b|\bZEROFILL\b|\bAUTO_INCREMENT\b', '', attrs, flags=re.I)
    attrs = re.sub(r'(?:^|\s+)COLLATE\s+[A-Za-z0-9_]+', ' ', attrs, flags=re.I)
    attrs = re.sub(r'(?:^|\s+)CHARACTER\s+SET\s+[A-Za-z0-9_]+', ' ', attrs, flags=re.I)
    attrs = re.sub(r'CURRENT_TIMESTAMP\s*\(\s*\d+\s*\)', 'CURRENT_TIMESTAMP', attrs, flags=re.I)
    attrs = re.sub(r'\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP(?:\s*\(\s*\d+\s*\))?', '', attrs, flags=re.I)
    attrs = re.sub(r'_utf8mb4|_utf8mb3', '', attrs, flags=re.I)
    attrs = re.sub(r'\s+', ' ', attrs).strip()
    if name in auto_pk_cols:
        return f'`{name}` INTEGER PRIMARY KEY AUTOINCREMENT'
    return f'`{name}` {map_type(mysql_type)}' + (f' {attrs}' if attrs else '')


def convert(source: str, schema_version: int = 1) -> tuple[str, int]:
    output = [
        '-- [Aster | 2026-09-13 | ASTER-MG | LAB DGB SQLITE SCHEMA V002]',
        '-- Conversion validated from the 93-table Gestor Mantto MySQL schema snapshot for SQLite WASM/sql.js.',
        '-- LAB ONLY. Never execute against Aiven or production.',
        'PRAGMA foreign_keys = OFF;',
        'PRAGMA recursive_triggers = ON;',
        ''
    ]
    count = 0

    for match in re.finditer(r'CREATE TABLE `([^`]+)` \((.*?)\) ENGINE=', source, re.S):
        table, body = match.group(1), match.group(2)
        items = split_top_level_commas(body)
        primary_cols: list[str] = []
        auto_cols: list[str] = []

        for item in items:
            primary = re.match(r'PRIMARY KEY\s*\((.*)\)$', item, re.I | re.S)
            if primary:
                primary_cols = [part.strip(' `') for part in split_top_level_commas(normalize_ident_list(primary.group(1)))]
            column = re.match(r'`([^`]+)`\s+(.+)$', item, re.S)
            if column and re.search(r'\bAUTO_INCREMENT\b', column.group(2), re.I):
                auto_cols.append(column.group(1))

        auto_pk_cols = set(auto_cols) if len(auto_cols) == 1 and primary_cols == auto_cols else set()
        columns: list[str] = []
        constraints: list[str] = []
        indexes: list[str] = []

        for item in items:
            if item.startswith('`'):
                columns.append(convert_column(item, auto_pk_cols))
                continue
            primary = re.match(r'PRIMARY KEY\s*\((.*)\)$', item, re.I | re.S)
            if primary:
                if not auto_pk_cols:
                    constraints.append('PRIMARY KEY (' + normalize_ident_list(primary.group(1)) + ')')
                continue
            unique = re.match(r'UNIQUE KEY\s+`([^`]+)`\s*\((.*)\)$', item, re.I | re.S)
            if unique:
                name, cols = unique.group(1), normalize_ident_list(unique.group(2))
                indexes.append(f'CREATE UNIQUE INDEX IF NOT EXISTS `{table}__{name}` ON `{table}` ({cols});')
                continue
            normal = re.match(r'KEY\s+`([^`]+)`\s*\((.*)\)$', item, re.I | re.S)
            if normal:
                name, cols = normal.group(1), normalize_ident_list(normal.group(2))
                indexes.append(f'CREATE INDEX IF NOT EXISTS `{table}__{name}` ON `{table}` ({cols});')
                continue
            constraint = re.match(r'CONSTRAINT\s+`([^`]+)`\s+(.+)$', item, re.I | re.S)
            if constraint:
                constraints.append(re.sub(r'_utf8mb4|_utf8mb3', '', constraint.group(2), flags=re.I))
                continue
            raise ValueError(f'Unsupported table clause in {table}: {item}')

        output += [
            f'-- Table: {table}',
            f'DROP TABLE IF EXISTS `{table}`;',
            f'CREATE TABLE `{table}` (',
            '  ' + ',\n  '.join(columns + constraints),
            ');',
            *indexes,
            ''
        ]
        count += 1

    output += [
        f'PRAGMA user_version = {int(schema_version)};',
        'PRAGMA foreign_keys = ON;',
        '',
        f'-- Tables converted: {count}',
        ''
    ]
    return '\n'.join(output), count


def main() -> int:
    parser = argparse.ArgumentParser(description='Convert Gestor Mantto MySQL table DDL to SQLite for LAB DGB.')
    parser.add_argument('source', type=pathlib.Path)
    parser.add_argument('output', type=pathlib.Path)
    parser.add_argument('--schema-version', type=int, default=1)
    args = parser.parse_args()

    converted, count = convert(
        args.source.read_text(encoding='utf-8', errors='replace'),
        schema_version=args.schema_version
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(converted, encoding='utf-8')
    print(f'Converted {count} tables -> {args.output}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
