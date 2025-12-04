import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Gamepad2, Trophy, User, BookOpen, LogOut, ChevronDown, Plus, Loader2 } from 'lucide-react';
import { AuthScreenSupabase } from './components/AuthScreenSupabase';
import { Minigames } from './components/Minigames';
import { FamilyRanking } from './components/FamilyRanking';
import { UserProfile } from './components/UserProfile';
import { RecyclingGuide } from './components/RecyclingGuide';
import { Logo } from './components/Logo';
import { PlayerProviderSupabase } from './components/PlayerContextSupabase';
import { supabaseClient, Perfil } from './lib/supabaseClient';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from './components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import { AVATARS, clearSessionData } from './lib/gameUtils';

export default function App() {
  // Dados da sessão atual
  const [tokenFamiliar, setTokenFamiliar] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Perfil | null>(null);
  const [membros, setMembros] = useState<Perfil[]>([]);
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(true);
  
  // Estados do dialog de adicionar membro
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('👨');
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState('');

  // Quando o app carrega, tenta recuperar a sessão salva
  useEffect(() => {
    const loadSavedSession = async () => {
      const savedToken = localStorage.getItem('recycle_token_familiar');
      const savedPlayerId = localStorage.getItem('recycle_current_player_id');
      
      if (savedToken && savedPlayerId) {
        try {
          // Verifica se o token ainda é válido
          const existe = await supabaseClient.tokenFamiliarExiste(savedToken);
          
          if (existe) {
            // Busca os membros da família
            const membrosData = await supabaseClient.obterMembrosFamilia(savedToken);
            
            // Tenta encontrar o jogador que estava logado
            const playerAtual = membrosData.find(m => m.id === savedPlayerId);
            
            if (playerAtual) {
              setTokenFamiliar(savedToken);
              setMembros(membrosData);
              setCurrentPlayer(playerAtual);
            } else {
              // Se não achou o jogador, limpa tudo
              clearSessionData();
            }
          } else {
            // Token não existe mais, limpa
            clearSessionData();
          }
        } catch (error) {
          console.error('Erro ao carregar sessão:', error);
          clearSessionData();
        }
      }
      
      setLoading(false);
    };
    
    loadSavedSession();
  }, []);

  // Quando alguém faz login pela primeira vez
  const handleLogin = (token: string, perfil: Perfil, todosMembros: Perfil[]) => {
    setTokenFamiliar(token);
    setCurrentPlayer(perfil);
    setMembros(todosMembros);
    
    // Guarda no localStorage pra próxima vez
    localStorage.setItem('recycle_token_familiar', token);
    localStorage.setItem('recycle_current_player_id', perfil.id);
  };

  // Quando alguém troca de jogador
  const handleSwitchPlayer = async (perfil: Perfil) => {
    setCurrentPlayer(perfil);
    localStorage.setItem('recycle_current_player_id', perfil.id);
    
    // Busca os dados atualizados do jogador
    try {
      const perfilAtualizado = await supabaseClient.obterPerfil(perfil.id);
      setCurrentPlayer(perfilAtualizado);
      
      // Atualiza a lista de membros também
      if (tokenFamiliar) {
        const membrosAtualizados = await supabaseClient.obterMembrosFamilia(tokenFamiliar);
        setMembros(membrosAtualizados);
      }
    } catch (error) {
      console.error('Erro ao trocar jogador:', error);
    }
  };

  // Reseta o formulário de adicionar membro
  const resetAddMemberForm = () => {
    setNewMemberName('');
    setNewMemberAvatar('👨');
    setAddMemberError('');
  };

  // Adiciona um novo membro à família
  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      setAddMemberError('Digite o nome do novo membro');
      return;
    }
    
    if (!tokenFamiliar) {
      setAddMemberError('Token familiar não encontrado');
      return;
    }
    
    setAddingMember(true);
    setAddMemberError('');
    
    try {
      const novoPerfil = await supabaseClient.criarPerfil(
        newMemberName.trim(),
        newMemberAvatar,
        tokenFamiliar
      );
      
      // Atualiza a lista de membros
      const membrosAtualizados = await supabaseClient.obterMembrosFamilia(tokenFamiliar);
      setMembros(membrosAtualizados);
      
      resetAddMemberForm();
      setAddMemberDialogOpen(false);
      
      toast.success(`${novoPerfil.nome_integrante} foi adicionado à família!`);
    } catch (err: any) {
      setAddMemberError(err.message || 'Erro ao adicionar membro');
    } finally {
      setAddingMember(false);
    }
  };

  // Quando o usuário sai
  const handleLogout = () => {
    clearSessionData();
    setTokenFamiliar(null);
    setCurrentPlayer(null);
    setMembros([]);
  };

  // Tela de loading enquanto verifica a sessão
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-green-700">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não tá logado, mostra a tela de autenticação
  if (!tokenFamiliar || !currentPlayer) {
    return <AuthScreenSupabase onLogin={handleLogin} />;
  }

  // Tela principal do app
  return (
    <PlayerProviderSupabase player={currentPlayer} tokenFamiliar={tokenFamiliar}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Toaster />
        
        {/* Cabeçalho fixo no topo */}
        <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-green-500">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between">
              {/* Logo do aplicativo */}
              <div className="hidden md:block">
                <Logo size="md" showText={true} />
              </div>
              <div className="md:hidden">
                <Logo size="sm" showText={true} />
              </div>

              {/* Menu do usuário e ações */}
              <div className="flex items-center gap-2 md:gap-4">
                {/* Dropdown pra trocar de jogador */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-green-300 hover:bg-green-50 gap-2">
                      <div className="text-xl">{currentPlayer.avatar}</div>
                      <div className="text-left hidden sm:block">
                        <p className="text-xs text-green-600 leading-tight">Jogador</p>
                        <p className="font-semibold text-green-800 text-sm leading-tight">{currentPlayer.nome_integrante}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-green-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      Família {tokenFamiliar}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Lista de todos os membros */}
                    {membros.map((membro) => (
                      <DropdownMenuItem
                        key={membro.id}
                        onClick={() => handleSwitchPlayer(membro)}
                        className={membro.id === currentPlayer.id ? 'bg-green-50' : ''}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-xl">{membro.avatar}</span>
                          <div className="flex-1">
                            <p className="font-semibold">{membro.nome_integrante}</p>
                            <p className="text-xs text-gray-500">{membro.pontos} pts • {membro.precisao.toFixed(0)}%</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    {/* Botão pra adicionar novo membro */}
                    <DropdownMenuItem onClick={() => setAddMemberDialogOpen(true)}>
                      <div className="flex items-center gap-2 w-full text-green-700">
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Membro</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Modal pra adicionar novo membro */}
                <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Membro</DialogTitle>
                      <DialogDescription>
                        Adicione um novo membro à família {tokenFamiliar}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {addMemberError && (
                        <Alert variant="destructive">
                          <AlertDescription>{addMemberError}</AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Campo do nome */}
                      <div className="space-y-2">
                        <Label htmlFor="newMemberName">Nome do Membro</Label>
                        <Input
                          id="newMemberName"
                          placeholder="Digite o nome"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          disabled={addingMember}
                          onKeyDown={(e) => e.key === 'Enter' && !addingMember && handleAddMember()}
                        />
                      </div>
                      
                      {/* Seleção de avatar */}
                      <div className="space-y-2">
                        <Label>Escolha o Avatar</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {AVATARS.map((avatar) => (
                            <button
                              key={avatar}
                              onClick={() => setNewMemberAvatar(avatar)}
                              disabled={addingMember}
                              className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                                newMemberAvatar === avatar
                                  ? 'border-green-500 bg-green-100 scale-110'
                                  : 'border-gray-300 hover:border-green-300'
                              } ${addingMember ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {avatar}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAddMemberDialogOpen(false);
                          resetAddMemberForm();
                        }}
                        disabled={addingMember}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddMember}
                        disabled={!newMemberName.trim() || addingMember}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {addingMember ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adicionando...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Botão de sair */}
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="ml-1 hidden lg:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo principal com as abas */}
        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Menu de navegação */}
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto bg-white/80 backdrop-blur-sm shadow-lg border-2 border-green-200">
              <TabsTrigger 
                value="games" 
                className="flex items-center gap-2 py-4 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                <Gamepad2 className="w-5 h-5" />
                <span className="hidden sm:inline">Minigames</span>
                <span className="sm:hidden">Jogos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ranking" 
                className="flex items-center gap-2 py-4 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                <Trophy className="w-5 h-5" />
                <span className="hidden sm:inline">Ranking</span>
                <span className="sm:hidden">Rank</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-2 py-4 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger 
                value="guide" 
                className="flex items-center gap-2 py-4 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                <BookOpen className="w-5 h-5" />
                <span className="hidden sm:inline">Guia</span>
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo de cada aba */}
            <TabsContent value="games" className="mt-0">
              <Minigames />
            </TabsContent>

            <TabsContent value="ranking" className="mt-0">
              <FamilyRanking />
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <UserProfile />
            </TabsContent>

            <TabsContent value="guide" className="mt-0">
              <RecyclingGuide />
            </TabsContent>
          </Tabs>
        </main>

        {/* Rodapé */}
        <footer className="bg-white border-t-4 border-green-500 mt-12 shadow-lg">
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Logo e descrição */}
              <div className="space-y-3">
                <Logo size="sm" showText={true} />
                <p className="text-sm text-gray-600">
                  Educação ambiental gamificada para jovens e famílias. Aprenda sobre reciclagem de forma divertida!
                </p>
              </div>

              {/* Legenda de cores */}
              <div>
                <h4 className="text-green-800 mb-3">Cores da Reciclagem</h4>
                <div className="grid grid-cols-5 gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-green-600 shadow-lg"></div>
                    <span className="text-xs text-gray-600">Verde</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-blue-600 shadow-lg"></div>
                    <span className="text-xs text-gray-600">Azul</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 shadow-lg"></div>
                    <span className="text-xs text-gray-600">Amarelo</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-red-600 shadow-lg"></div>
                    <span className="text-xs text-gray-600">Vermelho</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-gray-600 shadow-lg"></div>
                    <span className="text-xs text-gray-600">Cinza</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-6 pt-6 border-t border-green-200 text-center">
              <p className="text-sm text-gray-600">
                © 2025 Recycle Show - Todos os direitos reservados | Desenvolvido com 💚 para o meio ambiente
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PlayerProviderSupabase>
  );
}