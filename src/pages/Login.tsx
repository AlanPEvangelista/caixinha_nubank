import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authenticateUser, createUser } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { testDatabase, clearDatabase } from "@/services/database";
import { DatabaseManager } from "@/components/DatabaseManager";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login flow
        const userId = await authenticateUser(username, password);
        if (userId) {
          // Use the login function from AuthContext to update the authentication state
          login(userId);
          
          // Show success message
          toast({
            title: "Sucesso",
            description: "Login realizado com sucesso!",
          });
          
          // Navigate to the main page
          navigate("/");
        } else {
          toast({
            title: "Erro",
            description: "Nome de usuário ou senha incorretos",
            variant: "destructive",
          });
        }
      } else {
        // Register flow
        try {
          const userId = await createUser(username, password);
          toast({
            title: "Sucesso",
            description: "Conta criada com sucesso!",
          });
          setIsLogin(true);
        } catch (error: any) {
          // Handle user creation errors
          if (error.message && error.message.includes('User already exists')) {
            toast({
              title: "Erro",
              description: "Nome de usuário já existe. Escolha outro nome de usuário.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro",
              description: error.message || "Ocorreu um erro ao criar a conta",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestDatabase = async () => {
    try {
      const result = await testDatabase();
      if (result) {
        toast({
          title: "Sucesso",
          description: "Teste de banco de dados concluído com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: "Teste de banco de dados falhou",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao testar o banco de dados",
        variant: "destructive",
      });
    }
  };

  const handleClearDatabase = async () => {
    try {
      await clearDatabase();
      toast({
        title: "Sucesso",
        description: "Banco de dados limpo com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao limpar o banco de dados",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Login" : "Criar Conta"}</CardTitle>
          <CardDescription>
            {isLogin ? "Entre na sua conta" : "Crie uma nova conta"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full"
            >
              {isLogin ? "Não tem uma conta? Criar conta" : "Já tem uma conta? Fazer login"}
            </Button>
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestDatabase}
                className="flex-1"
              >
                Testar Banco
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearDatabase}
                className="flex-1"
              >
                Limpar Banco
              </Button>
            </div>
            <DatabaseManager />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}