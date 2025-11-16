const PDFDocument = require("pdfkit");

function gerarCertificado(empresa, res) {
    const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=certificado-${empresa.cnpj}.pdf`
    );

    doc.pipe(res);

    // ==========================
    // CONFIGURAÇÕES VISUAIS
    // ==========================
    const PADDING = 40;
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const innerWidth = pageWidth - 2 * PADDING;
    const center = pageWidth / 2;

    const DEEP_BLUE = "#00509d"; 
    const TEXT_COLOR = "#333";

    // ==========================
    // FUNDO E BORDA
    // ==========================
    doc.rect(0, 0, pageWidth, pageHeight).fill("#ffffff");

    doc.lineWidth(5)
        .rect(PADDING, PADDING, innerWidth, pageHeight - 2 * PADDING)
        .stroke(DEEP_BLUE);

    // Tarjas laterais
    doc.rect(0, 0, 12, pageHeight).fill(DEEP_BLUE);
    doc.rect(pageWidth - 12, 0, 12, pageHeight).fill(DEEP_BLUE);

    // ==========================
    // LOGO (placeholder)
    // ==========================
    const logoSize = 100;
    const logoX = center - logoSize / 2;

    doc.fontSize(18)
        .fillColor(DEEP_BLUE)
        .font("Helvetica-Bold")
        .text("LOGO AQUI", logoX, 80, {
            width: logoSize,
            align: "center",
        });

    let currentY = 200;

    // ==========================
    // TÍTULO PRINCIPAL
    // ==========================
    doc.fontSize(58)
        .fillColor(DEEP_BLUE)
        .font("Helvetica-Bold")
        .text("CERTIFICADO", PADDING, currentY, {
            width: innerWidth,
            align: "center",
        });

    currentY = doc.y + 10;

    doc.fontSize(24)
        .fillColor(DEEP_BLUE)
        .font("Helvetica")
        .text("DE RECONHECIMENTO EMPRESARIAL", PADDING, currentY, {
            width: innerWidth,
            align: "center",
        });

    currentY = doc.y + 40;

    // ==========================
    // TEXTO PRINCIPAL
    // ==========================
    doc.fontSize(18)
        .fillColor(TEXT_COLOR)
        .font("Helvetica")
        .text(
            `A 100 Open Startups tem a honra de conferir este certificado à empresa abaixo:`,
            PADDING,
            currentY,
            { width: innerWidth, align: "center" }
        );

    currentY = doc.y + 30;

    // ==========================
    // RAZÃO SOCIAL
    // ==========================
    doc.fontSize(46)
        .fillColor(DEEP_BLUE)
        .font("Helvetica-Bold")
        .text(empresa.razao_social, PADDING, currentY, {
            width: innerWidth,
            align: "center",
        });

    currentY = doc.y + 40;

    // ==========================
    // TEXTO PARA TROFÉU
    // ==========================
    doc.fontSize(26)
        .fillColor(TEXT_COLOR)
        .font("Helvetica-Oblique")
        .text(empresa.texto_trofeu || "", PADDING, currentY, {
            width: innerWidth,
            align: "center",
        });

    currentY = doc.y + 25;

    // ==========================
    // CATEGORIA
    // ==========================
    doc.fontSize(22)
        .fillColor(DEEP_BLUE)
        .font("Helvetica")
        .text(`Categoria: ${empresa.categoria || ""}`, PADDING, currentY, {
            width: innerWidth,
            align: "center",
        });

    // ==========================
    // ASSINATURA
    // ==========================
    const signatureY = pageHeight - 140;

    doc.lineWidth(1)
        .moveTo(center - 150, signatureY)
        .lineTo(center + 150, signatureY)
        .stroke(DEEP_BLUE);

    doc.fontSize(16)
        .fillColor(DEEP_BLUE)
        .font("Helvetica-Bold")
        .text("100 Open Startups", center - 150, signatureY + 10, {
            width: 300,
            align: "center",
        });

    // ==========================
    // RODAPÉ COM CNPJ E DATA
    // ==========================
    const today = new Date().toLocaleDateString("pt-BR");

    doc.fontSize(10)
        .fillColor("#666")
        .text(`CNPJ: ${empresa.cnpj} | Emissão: ${today}`, PADDING, pageHeight - 30);

    doc.end();
}

module.exports = gerarCertificado;
