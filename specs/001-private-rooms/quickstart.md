# Quickstart Validation: Salas Privadas

## Testes Automatizados
1. Backend:
   ```bash
   cd api && npm test
   ```
2. Frontend:
   ```bash
   cd web && npm test -- --watch=false && npm run build
   ```

## Validação Manual End-to-End
1. Subir backend (`cd api && npm start`) e frontend (`cd web && ng serve`).
2. Abrir `http://localhost:4200/sala-teste-privada` (sala vazia): confirmar botão **Tornar privada** no cabeçalho.
3. Definir senha (ex.: `segredo123`): confirmar badge **Sala Privada** e upload/listagem funcionando.
4. Abrir a mesma URL em aba anônima: confirmar exibição da tela de senha, ausência de arquivos listados (`401` na rede) e bloqueio de download sem ticket.
5. Informar senha incorreta repetidas vezes e confirmar `429`; depois informar senha correta e confirmar download + exclusão + `Limpar Sala` (que libera a sala como pública vazia novamente).
