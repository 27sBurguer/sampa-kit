const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS SUPER PERMISSIVO para Render
app.use(cors({
  origin: '*', // Permite TODAS as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Middleware para OPTIONS (pré-flight)
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Nodemailer
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Testar conexão com Gmail
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erro no email:', error);
  } else {
    console.log('✅ Email configurado!');
  }
});

// Rota principal
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 DJ Sampa Email Server Online!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Rota GET para /send
app.get('/send', (req, res) => {
  res.json({
    message: '📧 Rota de emails DJ Sampa',
    instructions: 'Use POST para enviar emails'
  });
});

// Rota POST para enviar emails
app.post('/send', async (req, res) => {
  try {
    console.log('📨 Recebendo solicitação de email...');
    
    const { name, email, message } = req.body;

    // Validação
    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        error: 'Todos os campos são obrigatórios!'
      });
    }

    console.log(`📧 Processando email de: ${name} (${email})`);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `🎵 Contato DJ Sampa - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #c49a6c;">🎧 NOVO CONTATO - DJ SAMPA</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
            <p><strong>👤 Nome:</strong> ${name}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>📅 Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <div style="margin-top: 15px;">
            <strong>💬 Mensagem:</strong>
            <p style="background: white; padding: 10px; border-radius: 5px; border-left: 4px solid #c49a6c;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado: ${name}`);

    res.json({
      ok: true,
      message: 'Email enviado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    res.status(500).json({
      ok: false,
      error: 'Erro interno do servidor: ' + error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'DJ Sampa Email Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota de fallback para 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    availableRoutes: ['GET /', 'GET /send', 'POST /send', 'GET /health']
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor DJ Sampa rodando na porta ${PORT}`);
  console.log(`📧 Email: ${process.env.GMAIL_USER}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
});