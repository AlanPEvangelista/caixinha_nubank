# Guia de Implantação para Servidor Caseiro (192.168.100.117)

Este guia fornece instruções passo a passo para implantar manualmente o aplicativo Caixinha Nubank no seu servidor caseiro no endereço IP 192.168.100.117 com o usuário de rede alan.

## Pré-requisitos

1. Acesso SSH ao servidor (192.168.100.117)
2. Conta de usuário: alan
3. Conexão com a internet no servidor
4. Privilégios sudo (se for instalar pacotes do sistema)
5. Node.js v20.19.5 instalado (opcional, caso já tenha instalado)
6. npm v10.8.2 instalado (opcional, caso já tenha instalado)
7. git v2.39.5 instalado (opcional, caso já tenha instalado)

### Versões Mínimas Necessárias das Dependências

Para executar este projeto corretamente, você precisa ter instaladas pelo menos as seguintes versões:

- **Node.js**: v18.0.0 ou superior (Versão atual utilizada: v20.19.5)
- **npm**: v8.0.0 ou superior (Versão atual utilizada: v10.8.2)
- **Git**: v2.30.0 ou superior (Versão atual utilizada: v2.39.5)

Além disso, o projeto utiliza diversas bibliotecas e frameworks com as seguintes versões mínimas requeridas:

#### Dependências Principais:
- **React**: v18.0.0 ou superior (Versão atual: v18.3.1)
- **Express**: v4.18.0 ou superior (Versão atual: v4.21.2)
- **TypeScript**: v5.0.0 ou superior (Versão atual: v5.5.3)
- **Vite**: v5.0.0 ou superior (Versão atual: v6.3.4)
- **Tailwind CSS**: v3.0.0 ou superior (Versão atual: v3.4.11)
- **@tanstack/react-query**: v5.0.0 ou superior (Versão atual: v5.56.2)
- **react-router-dom**: v6.0.0 ou superior (Versão atual: v6.26.2)
- **sql.js**: v1.0.0 ou superior (Versão atual: v1.13.0)
- **sqlite3**: v5.0.0 ou superior (Versão atual: v5.1.7)

#### Dependências de Desenvolvimento:
- **@vitejs/plugin-react-swc**: v3.0.0 ou superior (Versão atual: v3.9.0)
- **ESLint**: v8.0.0 ou superior (Versão atual: v9.9.0)
- **PostCSS**: v8.0.0 ou superior (Versão atual: v8.4.47)

## Passo 1: Conectar ao Servidor

Conecte-se ao seu servidor caseiro via SSH:

```bash
ssh alan@192.168.100.117
```

## Passo 2: Instalar Dependências do Sistema

Atualize a lista de pacotes e instale os pacotes do sistema necessários:

```bash
# Executar em qualquer pasta
sudo apt update
sudo apt install -y nodejs npm git
```

Nota: Se você já possui as versões necessárias do Node.js, npm e git instaladas (como no seu servidor 192.168.100.117), pode pular este passo. Este passo é útil para instalação em novas máquinas que não possuem essas ferramentas instaladas.

Nota: Se o Node.js não estiver disponível nos repositórios padrão ou você precisar de uma versão específica, você pode instalá-lo usando o NodeSource:

```bash
# Opcional: Instalar Node.js via NodeSource para uma versão mais recente
# Executar em qualquer pasta
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

## Passo 3: Clonar ou Transferir o Aplicativo

Opção 1: Clonar o repositório (se estiver hospedado em um repositório Git):
```bash
# Executar na pasta desejada para a instalação (por exemplo, /home/alan/)
git clone <url-do-repositorio> caixinha
cd caixinha
```

Opção 2: Transferir arquivos da sua máquina local:
```bash
# Execute este comando na sua máquina local, não no servidor
scp -r /home/alan/Documentos/projetos/nubank/caixinha_nubank alan@192.168.100.117:/home/alan/caixinha
```

Então no servidor:
```bash
# Executar na pasta raiz do projeto (/home/alan/caixinha)
cd /home/alan/caixinha
```

## Passo 4: Instalar Dependências do Aplicativo

Instale todas as dependências do Node.js necessárias:

```bash
# Executar na pasta raiz do projeto (/home/alan/caixinha)
npm install
```

Nota: Este projeto agora usa npm em vez de pnpm. Se você preferir usar pnpm, instale-o com `sudo npm install -g pnpm` e use `pnpm install` em vez disso.

## Passo 5: Construir o Aplicativo

Crie uma build de produção do aplicativo frontend:

```bash
# Executar na pasta raiz do projeto (/home/alan/caixinha)
npm run build
```

Isso irá gerar os arquivos de produção no diretório `dist`.

## Passo 6: Configurar o Serviço do Aplicativo

O aplicativo inclui um servidor Express.js para servir os arquivos frontend e fornecer a API backend. Configure-o como um serviço do sistema:

1. Copie o arquivo de serviço para o diretório systemd:
```bash
# Executar na pasta raiz do projeto (/home/alan/caixinha)
sudo cp /home/alan/caixinha/nubank-tracker.service /etc/systemd/system/
```

2. Recarregue o systemd para reconhecer o novo serviço:
```bash
# Executar em qualquer pasta
sudo systemctl daemon-reload
```

3. Habilite o serviço para iniciar na inicialização:
```bash
# Executar em qualquer pasta
sudo systemctl enable nubank-tracker
```

4. Inicie o serviço:
```bash
# Executar em qualquer pasta
sudo systemctl start nubank-tracker
```

5. Verifique o status do serviço:
```bash
# Executar em qualquer pasta
sudo systemctl status nubank-tracker
```

## Passo 7: Configurar o Firewall (se aplicável)

Se você tiver um firewall habilitado, permita o tráfego na porta 3002 (porta padrão do servidor):

```bash
# Executar em qualquer pasta
sudo ufw allow 3002/tcp
```

## Passo 8: Acessar o Aplicativo

Abra um navegador web e navegue para:

```
http://192.168.100.117:3002
```

## Manutenção

Para atualizar o aplicativo:

1. Obtenha as últimas alterações (se estiver usando Git):
```bash
# Executar na pasta raiz do projeto (/home/alan/caixinha)
cd /home/alan/caixinha
git pull
```

2. Ou transfira novos arquivos da sua máquina de desenvolvimento.

3. Reinstale as dependências se necessário:
```bash
# Executar na pasta raiz do projeto (/home/alan/caixinha)
npm install
```

4. Reconstrua o aplicativo:
```bash
# Executar na pasta raiz do projeto (/home/alan/caixinha)
npm run build
```

5. Reinicie o serviço:
```bash
# Executar em qualquer pasta
sudo systemctl restart nubank-tracker
```

## Solução de Problemas

1. Se o aplicativo não carregar:
   - Verifique os logs do serviço: `sudo journalctl -u nubank-tracker -f`
   - Verifique se a build foi bem-sucedida e os arquivos existem no diretório `dist`
   - Verifique se o serviço está em execução: `sudo systemctl status nubank-tracker`

2. Se ocorrerem problemas de permissões:
   - Verifique a propriedade dos arquivos: `ls -la /home/alan/caixinha`
   - Garanta que o usuário alan possa ler os arquivos: `chmod -R 755 /home/alan/caixinha`

3. Se o banco de dados não estiver funcionando:
   - Verifique se o diretório `data` existe e tem as permissões corretas
   - O banco de dados SQLite é armazenado em `/home/alan/caixinha/data/nubank_tracker.db`