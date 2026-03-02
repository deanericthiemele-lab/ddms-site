import streamlit as st
import pandas as pd
import numpy as np
from datetime import timedelta
import plotly.express as px
from io import BytesIO

st.set_page_config(page_title="Tableau de Bord IA", layout="wide")

st.markdown("""
<style>
[data-testid="stAppViewContainer"] {
    background-color: #F2F2F2;
    color: #000000;
}
[data-testid="stSidebar"] {
    background-color: #1E1E1E;
}
div[data-testid="metric-container"] {
    background-color: #1E1E1E;
    border-radius: 10px;
    padding: 10px;
    color: #FFFFFF;
}
</style>
""", unsafe_allow_html=True)

st.title("📡 Tableau de Bord IA - Prédiction ND à Risque")

uploaded_file = st.file_uploader("📂 Importer le fichier Excel des incidents", type=["xlsx"])
if not uploaded_file:
    uploaded_file = "data.xlsx"

df = pd.read_excel(uploaded_file)
df['DATE DE CRÉATION'] = pd.to_datetime(df['DATE DE CRÉATION'], errors='coerce')
df['DATE DE FIN'] = pd.to_datetime(df['DATE DE FIN'], errors='coerce')
df['DUREE_MIN'] = df['DUREE'].astype(str).str.extract(r'(\d+)').fillna(0).astype(int)
df['ND'] = df['ND'].astype(str)

freq = df.groupby('ND').agg({
    'DATE DE CRÉATION': ['count', 'max'],
    'DUREE_MIN': 'mean'
})
freq.columns = ['freq_incidents', 'last_incident', 'mean_duree']
freq = freq.reset_index()

freq['avg_interval'] = df.groupby('ND')['DATE DE CRÉATION'].apply(lambda x: np.mean(np.diff(np.sort(x.values)).astype('timedelta64[D]')) if len(x)>1 else np.nan).values
freq['avg_interval'] = freq['avg_interval'].fillna(freq['avg_interval'].median())

freq['risk_score'] = (freq['freq_incidents']/freq['freq_incidents'].max())*0.6 + \
                     (freq['mean_duree']/freq['mean_duree'].max())*0.3 + \
                     ((freq['avg_interval'].max()-freq['avg_interval'])/freq['avg_interval'].max())*0.1
freq['risk_score'] = (freq['risk_score']/freq['risk_score'].max()*100).round(1)

freq['predicted_date'] = freq['last_incident'] + pd.to_timedelta(freq['avg_interval'], unit='D')
freq['predicted_date'] = freq['predicted_date'].dt.strftime("%d/%m/%Y")

def risk_label(x):
    if x>=80: return "🔴 Élevé"
    elif x>=40: return "🟠 Moyen"
    else: return "🟢 Faible"
freq['Statut'] = freq['risk_score'].apply(risk_label)

# Calcul du nombre de ND à risque
nd_risque = (freq['risk_score'] >= 40).sum()

st.subheader("Résumé global")
col1, col2, col3, col4, col5 = st.columns(5)
col1.metric("Incidents totaux", len(df))
col2.metric("ND surveillés", freq['ND'].nunique())
col3.metric("Durée moyenne (min)", int(df['DUREE_MIN'].mean()))
col4.metric("ND à risque élevé", (freq['risk_score']>=80).sum())
col5.metric("Prochaine vague", freq.loc[freq['risk_score']>=80, 'predicted_date'].min() or "—")

high_risk = (freq['risk_score']>=80).sum()
if high_risk>0:
    st.error(f"🚨 {high_risk} ND présentent un risque très élevé cette semaine !")

# Affichage du titre avec nombre de ND à risque
st.subheader(f"📋 Prédictions ND à Risque ({nd_risque} ND à risque)")

# Tableau scrollable
st.dataframe(freq[['ND','freq_incidents','mean_duree','risk_score','predicted_date','Statut']]
             .sort_values('risk_score',ascending=False), height=450)

# Export Excel corrigé
buffer = BytesIO()
freq.to_excel(buffer, index=False, engine='openpyxl')
st.download_button("📤 Exporter les prévisions Excel",
                   data=buffer.getvalue(),
                   file_name="nd_previsions.xlsx",
                   mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

# Graphiques
st.subheader("📊 Visualisations")
colA, colB = st.columns(2)
figA = px.bar(freq.sort_values('risk_score',ascending=False).head(10),
              x='ND', y='risk_score', title="Top 10 ND à risque",
              color='risk_score', color_continuous_scale='Reds')
colA.plotly_chart(figA, use_container_width=True)
figB = px.histogram(freq, x='predicted_date', title="Répartition des dates prévisionnelles")
colB.plotly_chart(figB, use_container_width=True)
