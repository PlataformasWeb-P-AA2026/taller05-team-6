import pandas as pd
import json
import pdfplumber
import os

def transformar_a_couchdb():
    lista_final = []
    
    # Rutas de archivos (ajustadas a tu estructura)
    ruta_html = 'data/fuente_html_europa.html'
    ruta_csv = 'data/fuente_csv_sudamerica.csv'
    ruta_pdf = 'data/fuente_pdf_norteamerica_asia.pdf'

    # 1. Procesar Fuente HTML (Europa)
    try:
        # Forzamos encoding utf-8 para capturar tildes y eñes
        tablas_html = pd.read_html(ruta_html, encoding='utf-8')
        df_europa = tablas_html[0]
        lista_final.extend(df_europa.to_dict(orient='records'))
        print("HTML procesado correctamente.")
    except Exception as e:
        print(f"Error procesando HTML: {e}")

    # 2. Procesar Fuente CSV (Sudamérica)
    try:
        # Si 'utf-8' falla o se ve mal, puedes cambiar a 'latin-1'
        try:
            df_sudamerica = pd.read_csv(ruta_csv, encoding='utf-8')
        except UnicodeDecodeError:
            df_sudamerica = pd.read_csv(ruta_csv, encoding='latin-1')
            
        lista_final.extend(df_sudamerica.to_dict(orient='records'))
        print("CSV procesado correctamente.")
    except Exception as e:
        print(f"Error procesando CSV: {e}")

    # 3. Procesar Fuente PDF (Norteamérica y Asia)
    try:
        with pdfplumber.open(ruta_pdf) as pdf:
            for pagina in pdf.pages:
                tabla = pagina.extract_table()
                if tabla:
                    headers = tabla[0]
                    for fila in tabla[1:]:
                        registro = dict(zip(headers, fila))
                        lista_final.append(registro)
        print("PDF procesado correctamente.")
    except Exception as e:
        print(f"Error procesando PDF: {e}")

    # 4. Formatear para CouchDB (_bulk_docs format)
    couch_format = {
        "docs": lista_final
    }

    # 5. Exportar a JSON con soporte total de caracteres
    # Usamos ensure_ascii=False para que se vean las eñes en el archivo final
    with open('data/mundial_2026.json', 'w', encoding='utf-8') as f:
        json.dump(couch_format, f, indent=5, ensure_ascii=False)
    
    print(f"\n--- Éxito ---")
    print(f"Transformación completada. {len(lista_final)} registros procesados.")
    print(f"Archivo generado: data/mundial_2026.json")

if __name__ == "__main__":
    transformar_a_couchdb()