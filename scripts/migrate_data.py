
import sqlite3
import psycopg2
from psycopg2 import extras
import os

# Configurações
SQLITE_PATH = r'c:\Users\CALL MOBILE\Music\project\prisma\dev.db'
POSTGRES_URL = "postgresql://postgres:808090@localhost:5432/sistema_de_gestao"

def migrate():
    try:
        # Conectar ao SQLite
        sqlite_conn = sqlite3.connect(SQLITE_PATH)
        sqlite_conn.row_factory = sqlite3.Row
        sqlite_cursor = sqlite_conn.cursor()

        # Conectar ao Postgres
        pg_conn = psycopg2.connect(POSTGRES_URL)
        pg_cursor = pg_conn.cursor()

        tables = ['User', 'Product', 'Transaction', 'ServiceOrder', 'StockMovement', 'PettyCash', 'SystemLog']

        for table in tables:
            print(f"Migrando tabela {table}...")
            
            # Ler sqlite
            sqlite_cursor.execute(f"SELECT * FROM {table}")
            rows = sqlite_cursor.fetchall()
            
            if not rows:
                print(f"Tabela {table} vazia.")
                continue

            # Preparar insert para Postgres
            cols = rows[0].keys()
            
            # Mapear 'id' do SQLite para o Postgres se necessário, mas ambos usam colunas iguais no Prisma
            query = f"INSERT INTO \"{table}\" ({', '.join([f'\"{c}\"' for c in cols])}) VALUES ({', '.join(['%s'] * len(cols))}) ON CONFLICT DO NOTHING"
            
            data = [tuple(row) for row in rows]
            
            pg_cursor.executemany(query, data)
            print(f"Inseridos {len(rows)} registros na tabela {table}.")

        pg_conn.commit()
        print("Migração concluída com sucesso!")

    except Exception as e:
        print(f"Erro: {e}")
    finally:
        if 'sqlite_conn' in locals(): sqlite_conn.close()
        if 'pg_conn' in locals(): pg_conn.close()

if __name__ == "__main__":
    migrate()
