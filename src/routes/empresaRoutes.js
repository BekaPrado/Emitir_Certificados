const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../config/db');
const gerarCertificado = require('../utils/gerarCertificado');

const upload = multer({ dest: 'uploads/' });

/**
 * ======================================
 * UPLOAD DE PLANILHA NOVA (4 COLUNAS)
 * ======================================
 */
router.post('/upload-empresas', upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({ error: 'Planilha vazia' });
    }

    let count = 0;

    for (const row of rows) {

      const cnpjRaw =
        row["CNPJ para confrimacao"] ||
        row["CNPJ para confirmação"] ||
        row["CNPJ"] ||
        row["cnpj"] ||
        row["Cnpj"] ||
        null;

      const cnpj = cnpjRaw ? String(cnpjRaw).replace(/\D/g, "") : null;

      if (!cnpj || cnpj.length !== 14) {
        console.log("⚠ Linha ignorada (CNPJ inválido):", row);
        continue;
      }

      const razao_social =
        row["Razão Social"] ||
        row["Razao Social"] ||
        null;

      const texto_trofeu =
        row["TEXTO PARA TROFEU"] ||
        row["Texto para Trofeu"] ||
        row["Texto para troféu"] ||
        null;

      const categoria =
        row["CATEGORIA (texto 2)"] ||
        row["Categoria"] ||
        null;

      // 🔵 INSERIR na tabela CERTA: empresas_certificados
      await db.query(`
        INSERT INTO empresas_certificados (razao_social, texto_trofeu, categoria, cnpj)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            razao_social = VALUES(razao_social),
            texto_trofeu = VALUES(texto_trofeu),
            categoria = VALUES(categoria)
      `, [razao_social, texto_trofeu, categoria, cnpj]);

      count++;
    }

    await db.query(
      `INSERT INTO historico_uploads (arquivo_nome, quantidade_empresas) VALUES (?, ?)`,
      [req.file.originalname, count]
    );

    res.json({ message: "Planilha importada com sucesso!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar planilha" });
  }
});

/**
 * ======================================
 * HISTÓRICO
 * ======================================
 */
router.get('/historico', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM historico_uploads ORDER BY data_upload DESC LIMIT 50"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

/**
 * ======================================
 * GERAR CERTIFICADO (TABELA NOVA)
 * ======================================
 */
router.get('/certificado/:cnpj', async (req, res) => {
  try {
    const { cnpj } = req.params;

    // 🔍 BUSCANDO NA TABELA CERTA
    const [rows] = await db.query(
      "SELECT * FROM empresas_certificados WHERE cnpj = ?",
      [cnpj]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }

    gerarCertificado(rows[0], res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar certificado" });
  }
});

module.exports = router;
