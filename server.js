const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS MELHOR CONFIGURADO
app.use(cors({
  origin: ['http://localhost', 'http://127.0.0.1', 'file://'], // Permite acesso local
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Testar conexão com Gmail
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erro na configuração do email:', error);
  } else {
    console.log('✅ Servidor de email configurado com sucesso!');
  }
});

// Rota principal
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Servidor DJ Sampa Online!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Rota GET para /send (para teste)
app.get('/send', (req, res) => {
  res.json({
    message: '📧 Rota de emails DJ Sampa!',
    instrucoes: 'Use POST para enviar emails'
  });
});

// Rota POST para enviar emails
app.post('/send', async (req, res) => {
  try {
    console.log('📨 Recebendo solicitação de email...', req.body);
    
    const { name, email, message } = req.body;

    // Validação
    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        error: 'Todos os campos são obrigatórios!'
      });
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `🎵 Novo Contato - DJ Sampa - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #c49a6c, #8b5a2b); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎧 DJ SAMPA</h1>
            <p style="color: white; margin: 5px 0 0 0;">Novo Contato Recebido</p>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">📋 Informações do Contato</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p><strong>👤 Nome:</strong> ${name}</p>
              <p><strong>📧 Email:</strong> ${email}</p>
              <p><strong>📅 Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            
            <h3 style="color: #333;">💬 Mensagem:</h3>
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #c49a6c;">
              <p style="margin: 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0;">🎵 DJ Sampa Press Kit • ${new Date().getFullYear()}</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado: ${name} (${email})`);

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
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎧 Servidor DJ Sampa rodando na porta ${PORT}`);
  console.log(`📧 Email: ${process.env.GMAIL_USER}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🌐 URL: http://127.0.0.1:${PORT}`);
});