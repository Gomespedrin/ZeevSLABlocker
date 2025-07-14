import { render } from 'preact';
import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { showError } from './alerts';

/* ─────────────── Tipagens ─────────────── */
interface TaskItem {
  cfe: string;
  cfetp: string;
  lk: string;
  el: string;
  t: string;
}

interface TaskResponse {
  success: { itens: TaskItem[] };
}

/* ─────────────── Tabela de tarefas ─────────────── */
function TaskTable({ tasks }: { tasks: TaskItem[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 font-semibold text-left">N° Tarefa</th>
            <th className="border px-4 py-2 font-semibold text-left">Vencimento</th>
            <th className="border px-4 py-2 font-semibold text-left">Nome da Tarefa</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, i) => (
            <tr key={task.cfe} className={i % 2 ? 'bg-gray-50' : ''}>
              <td className="border px-4 py-2">
                <a
                  href={task.lk}
                  tabIndex={0}
                  role="button"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {task.cfe}
                </a>
              </td>
              <td className="border px-4 py-2 font-semibold text-red-600">{task.el}</td>
              <td className="border px-4 py-2">{task.t}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────── Modal ─────────────── */
function SLAModal({
  tasks,
  onClose,
  onRefresh
}: {
  tasks: TaskItem[];
  onClose: () => void;
  onRefresh: () => Promise<void>;
}): JSX.Element {
  const [current, setCurrent] = useState<TaskItem[]>(tasks);
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState(new Date());

  useEffect(() => {
    const id = setInterval(handleRefresh, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setCurrent(tasks);
    setLast(new Date());
  }, [tasks]);

  const handleRefresh = async () => {
    setLoading(true);
    await onRefresh();
    setLast(new Date());
    setLoading(false);
  };

  const handleClose = () => {
    if (current.length === 0) return onClose();
    showError(
      'Bloqueio de novas solicitações',
      `Você ainda tem ${current.length} tarefa(s) pendente(s).`,
      {
        duration: 7000,
        actions: [{ label: 'Atualizar agora', onClick: handleRefresh, style: 'primary' }]
      }
    );
  };

  const fmt = (d: Date) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div
      id="sla-overlay"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30"
      style={{ zIndex: 94 }}
    >
      <div className="bg-white w-[70%] max-w-4xl max-h-[80vh] overflow-auto rounded-lg shadow-xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold text-gray-800">Atenção – Tarefas de Correção</h2>
          <button
            onClick={handleClose}
            className={`text-2xl font-bold ${
              current.length ? 'cursor-not-allowed text-gray-300' : 'text-gray-400 hover:text-gray-600'
            }`}
            title={current.length ? 'Feche somente após concluir' : 'Fechar'}
          >
            ×
          </button>
        </div>

        {/* Barra de status */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-3">
          <span className="text-sm text-gray-600">Última atualização: {fmt(last)}</span>
          <span
            className={`text-sm font-semibold ${
              current.length ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {current.length ? `${current.length} pendente(s)` : 'Nenhuma pendência'}
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 font-semibold transition ${
              loading
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {current.length ? (
            <>
              <p className="mb-6 text-lg text-gray-700">
                Conclua as tarefas abaixo antes de abrir novas solicitações:
              </p>
              <TaskTable tasks={current} />
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="mb-4 text-6xl">✅</div>
              <h3 className="mb-2 text-xl font-bold text-green-600">Tudo em dia!</h3>
              <p className="text-gray-600">Não há tarefas de correção pendentes.</p>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between border-t p-6">
          <p className="text-sm text-gray-600">
            ©{' '}
            <a
              href="https://raw.githubusercontent.com/Juevan/ZeevSLABlocker/main/LICENSE"
              target="_blank"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Licença do Projeto
            </a>
          </p>
          <button
            onClick={handleClose}
            disabled={!!current.length}
            className={`rounded-lg px-6 py-2 font-semibold transition ${
              current.length
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {current.length ? `Pendente (${current.length})` : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Utilidades ─────────────── */
function shouldExecute(): boolean {
  const p = location.pathname.toLowerCase();
  return p.includes('/my') && p.includes('/services');
}

/* Bypass total de licença */
async function validateLicense(): Promise<boolean> {
  return true;
}

/* Pequeno utilitário para injetar Tailwind compilado (se quiser) */
function injectStyles(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

/* ─────────────── Busca de tarefas atrasadas (GET) ─────────────── */
async function verificaAtrasos(): Promise<TaskItem[]> {
  const token = (document.querySelector(
    'input[name="__RequestVerificationToken"]'
  ) as HTMLInputElement)?.value;
  if (!token) return [];

  const kw = ['corrigir', 'correção', 'correcao', 'ajuste', 'ajustar'];
  const resultados: TaskItem[] = [];
  const visto = new Set<string>();

  for (const palavra of kw) {
    const url = `${location.origin}/api/internal/bpms/1.0/assignments?status=Late&length=100&keyword=${encodeURIComponent(
      palavra
    )}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'RequestVerificationToken': token },
      credentials: 'include'
    }).catch(() => null);

    if (res && res.ok) {
      const json: TaskResponse = await res.json();
      json.success?.itens?.forEach(t => {
        if (!visto.has(t.cfe)) {
          visto.add(t.cfe);
          resultados.push(t);
        }
      });
    }
  }
  return resultados;
}

/* ─────────────── Monta Modal ─────────────── */
function createModal(tasks: TaskItem[]): void {
  if (!tasks.length) return;

  const host = document.createElement('div');
  host.id = 'sla-modal-host';
  document.body.appendChild(host);

  const close = () => host.remove();
  const refresh = async () => {
    const novaLista = await verificaAtrasos();
    render(<SLAModal tasks={novaLista} onClose={close} onRefresh={refresh} />, host);
  };

  render(<SLAModal tasks={tasks} onClose={close} onRefresh={refresh} />, host);
}

/* ─────────────── Bootstrap ─────────────── */
(async () => {
  if (!shouldExecute()) return;
  await validateLicense(); // sempre true
  const atrasadas = await verificaAtrasos();
  if (atrasadas.length) {
    injectStyles('__CSS_CONTENT__'); // opcional
    createModal(atrasadas);
  }
})();

/* ─────────────── Fornece helpers no window (debug) ─────────────── */
if (typeof window !== 'undefined') {
  Object.assign(window as any, { shouldExecute, verificaAtrasos, createModal });
}

export { shouldExecute, verificaAtrasos, validateLicense };
