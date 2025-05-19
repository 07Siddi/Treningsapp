// Importerer nødvendige moduler
const express = require('express');
const app = express();
const { Pool } = require('pg');

// Konfigurerer tilkobling til PostgreSQL-databasen
const pool = new Pool({
  user: 'postgres',
  password: 'hei123',
  host: 'localhost',
  port: 5432,
});

// Definerer endepunkt for å vise treningsapp data
app.get('/treningsapp', async (req, res) => {
    try {
      // SQL-spørring som henter brukerdata med tilhørende gruppe- og treningsøktinformasjon
      const result = await pool.query(`
        SELECT 
          b.bruker_id,
          b.fornavn,
          b.etternavn,
          b.alder,
          b.epost,
          g.navn AS gruppenavn,
          t.type AS okt_type,
          t.varighet_minutter,
          t.dato
        FROM bruker b
        LEFT JOIN brukergruppe bg ON b.bruker_id = bg.bruker_id
        LEFT JOIN gruppe g ON bg.gruppe_id = g.gruppe_id
        LEFT JOIN treningsokt t ON b.bruker_id = t.bruker_id AND g.gruppe_id = t.gruppe_id
        ORDER BY b.bruker_id, t.dato DESC
      `);
  
      // Oppretter et objekt for å organisere brukerdata
      const brukereMap = {};
  
      // Behandler resultatene og organiserer data per bruker
      for (const row of result.rows) {
        const id = row.bruker_id;
        if (!brukereMap[id]) {
          brukereMap[id] = {
            navn: `${row.fornavn} ${row.etternavn}`,
            alder: row.alder,
            epost: row.epost,
            grupper: [],
          };
        }
  
        // Legger til gruppeinfo hvis brukeren er medlem av en gruppe
        if (row.gruppenavn) {
          brukereMap[id].grupper.push({
            navn: row.gruppenavn,
            okt_type: row.okt_type,
            varighet: row.varighet_minutter,
            dato: row.dato,
          });
        }
      }
  
      // Genererer HTML-respons med CSS styling
      let html = `
        <!DOCTYPE html>
        <html lang="no">
        <head>
            <meta charset="UTF-8">
            <title>Treningsapp – Brukere med grupper og økter</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    padding: 20px;
                }
                .kort {
                    background: white;
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 20px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .kort h2 {
                    margin: 0;
                }
                .gruppe {
                    margin-top: 10px;
                    padding-left: 15px;
                    border-left: 3px solid #007acc;
                }
                .gruppe p {
                    margin: 4px 0;
                }
            </style>
        </head>
        <body>
            <h1>Brukere, grupper og treningsøkter</h1>
      `;
  
      // Genererer HTML for hver bruker og deres data
      for (const [_, bruker] of Object.entries(brukereMap)) {
        html += `
          <div class="kort">
            <h2>${bruker.navn}</h2>
            <p><strong>Alder:</strong> ${bruker.alder}</p>
            <p><strong>E-post:</strong> ${bruker.epost}</p>
        `;
  
        // Viser gruppeinformasjon hvis brukeren er medlem av grupper
        if (bruker.grupper.length > 0) {
          html += `<h3>Grupper og treningsøkter:</h3>`;
          for (const g of bruker.grupper) {
            html += `
              <div class="gruppe">
                <p><strong>Gruppe:</strong> ${g.navn}</p>
                <p><strong>Økt:</strong> ${g.okt_type || '–'}</p>
                <p><strong>Varighet:</strong> ${g.varighet || '–'} min</p>
                <p><strong>Dato:</strong> ${g.dato || '–'}</p>
              </div>
            `;
          }
        } else {
          html += `<p><em>Ingen grupper registrert</em></p>`;
        }
  
        html += `</div>`;
      }
  
      html += `</body></html>`;
      res.send(html);
    } catch (error) {
      console.error('Feil ved henting av detaljer:', error);
      res.status(500).send('Noe gikk galt.');
    }
});

// Endepunkt for å hente rå databasedata i JSON-format
app.get('/database-json', async (req, res) => {
    try {
      // Henter data fra alle tabeller
      const brukere = await pool.query('SELECT * FROM bruker');
      const grupper = await pool.query('SELECT * FROM gruppe');
      const brukergrupper = await pool.query('SELECT * FROM brukergruppe');
      const treningsokter = await pool.query('SELECT * FROM treningsokt');
  
      // Returnerer all data som JSON
      res.json({
        brukere: brukere.rows,
        grupper: grupper.rows,
        brukergrupper: brukergrupper.rows,
        treningsokter: treningsokter.rows
      });
    } catch (error) {
      console.error('Feil ved henting av databaseinnhold:', error);
      res.status(500).json({ error: 'Feil ved henting av data' });
    }
});

// Starter serveren på port 3000
app.listen(3000, () => {
  console.log('Server lytter på port 3000');
});
