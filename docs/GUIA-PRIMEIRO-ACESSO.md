# Guia de Primeiro Acesso

## Objetivo
Este guia ajuda o primeiro usuario a entender os fluxos principais do sistema antes de operar no dia a dia.

## Arquitetura rapida
- Backend (`backend-agenda-pro`): API, regras de negocio, autenticacao e dados.
- Frontend privado (`frontend-agenda-pro`): painel interno para operacao da empresa.
- Fluxo publico (`/solicitar-agendamento`): pagina externa onde clientes solicitam horario.

## Fluxo de onboarding recomendado
1. Entrar em `Configuracoes > Empresa` e revisar dados principais.
2. Entrar em `Configuracoes > Agenda` e configurar:
   - `public_start_time`
   - `public_end_time`
   - `public_slot_minutes`
   - `public_working_days`
3. Cadastrar `Servicos` e `Profissionais` para disponibilidade real.
4. Validar agenda em tela publica usando o link de agendamento.
5. Somente depois compartilhar o link publico com clientes.

## Regras importantes
- Sem agenda publica configurada, o cliente externo nao deve conseguir concluir a solicitacao.
- Horario inicial precisa ser menor que horario final.
- Slot deve ser maior que zero.
- E necessario ter pelo menos um dia de atendimento ativo.

## Fluxo operacional diario
1. Acompanhar indicadores no `Dashboard`.
2. Gerenciar agenda em `Agenda`.
3. Atualizar dados de `Clientes`, `Servicos` e `Profissionais`.
4. Revisar `Estoque` e movimentacoes quando aplicavel.
5. Ajustar configuracoes de marca e agenda quando necessario.

## Checklist de primeiro acesso
- [ ] Dados da empresa revisados
- [ ] Agenda publica configurada e salva
- [ ] Servicos cadastrados
- [ ] Profissionais cadastrados
- [ ] Teste de solicitacao publica realizado
