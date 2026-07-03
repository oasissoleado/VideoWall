"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Plus, Trash2, GripVertical, ExternalLink, LogOut, Lock, Copy, Check } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Dashboard, DisplayConfig } from "@/types";

const AUTH_KEY = "videowall-admin-auth";
const DEMO_USER = "videowall@exel.com";
const DEMO_PASS = "Entrada01";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(AUTH_KEY) === "1");
    setChecked(true);
  }, []);

  if (!checked) return <div className="min-h-screen bg-[var(--bg)]" />;
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen">
      <Header onLogout={() => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); }} />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-6 space-y-10">
        <DashboardsSection />
        <ConfigSection />
        <DisplayUrlSection />
      </main>
    </div>
  );
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() === DEMO_USER && password === DEMO_PASS) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onSuccess();
    } else setError("Credenciales incorrectas.");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-[var(--surface-2)]">
          <LayoutGrid className="h-4 w-4" />
        </div>
        <span className="font-semibold">VideoWall Admin</span>
        <span className="ml-1 rounded-md bg-[var(--primary)]/15 px-1.5 py-0.5 text-[11px] font-medium text-[var(--primary)]">En vivo</span>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-[var(--surface-2)]"><Lock className="h-4 w-4 text-[var(--muted)]" /></div>
          <div>
            <h1 className="text-sm font-semibold">Iniciar sesión</h1>
            <p className="text-xs text-[var(--muted)]">Acceso al panel de operador</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3.5">
          <Field label="Correo"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required /></Field>
          <Field label="Contraseña"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} required /></Field>
          {error && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}
          <button type="submit" className="h-9 w-full rounded-md bg-[var(--primary)] text-sm font-medium text-[var(--bg)] hover:opacity-90">Entrar</button>
        </form>
        <div className="mt-5 rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-2)]/60 p-3">
          <p className="mb-1 text-[11px] uppercase tracking-wide text-[var(--muted)]">Credenciales demo</p>
          <p className="font-mono text-xs">videowall@exel.com</p>
          <p className="font-mono text-xs">Entrada01</p>
        </div>
      </div>
    </div>
  );
}

const inputCls = "h-9 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm outline-none focus:border-[var(--primary)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[var(--muted)]">{label}</label>
      {children}
    </div>
  );
}

function Header({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-[var(--surface-2)]"><LayoutGrid className="h-3.5 w-3.5" /></div>
          <span className="font-semibold tracking-tight">VideoWall Admin</span>
          <span className="ml-1 rounded-md bg-[var(--primary)]/15 px-1.5 py-0.5 text-[11px] font-medium text-[var(--primary)]">En vivo</span>
        </div>
        <div className="flex items-center gap-2">
          <a href="/display" target="_blank" className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs font-medium hover:bg-[var(--surface)]"><ExternalLink className="h-3.5 w-3.5" /> Ver display</a>
          <button onClick={onLogout} className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]" aria-label="Cerrar sesión"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </header>
  );
}

function DashboardsSection() {
  const [items, setItems] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function load() {
    const r = await fetch("/api/dashboards");
    setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function update(id: string, patch: Partial<Dashboard>) {
    const r = await fetch(`/api/dashboards/${id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(patch) });
    if (!r.ok) { alert((await r.json()).error ?? "Error"); load(); return; }
    setItems((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar dashboard?")) return;
    await fetch(`/api/dashboards/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((x) => x.id !== id));
  }

  async function add() {
    const r = await fetch("/api/dashboards", {
     method: "POST",
     headers: { "content-type": "application/json" },
     body: JSON.stringify({
      name: "Nuevo dashboard",
      url: "https://app.powerbi.com/view?r=..."
    })
  });

  if (!r.ok) {
    alert("No se pudo crear el dashboard.");
    return;
  }

  const dashboard: Dashboard = await r.json();

  setItems((prev) => [...prev, dashboard]);
 
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIdx, newIdx).map((it, i) => ({ ...it, order: i }));
    setItems(next);
    await fetch("/api/dashboards/reorder", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(next.map(({ id, order }) => ({ id, order }))) });
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Dashboards</h2>
        <button onClick={add} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--bg)] hover:opacity-90"><Plus className="h-3.5 w-3.5" /> Agregar</button>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        {loading ? (
          <div className="p-6 text-sm text-[var(--muted)]">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-[var(--muted)]">Aún no hay dashboards.</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-[var(--border)]">
                {items.map((d) => (
                  <Row key={d.id} d={d} onUpdate={update} onRemove={remove} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </section>
  );
}

function Row({ d, onUpdate, onRemove }: { d: Dashboard; onUpdate: (id: string, p: Partial<Dashboard>) => void; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: d.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 px-4 py-3">
      <button {...attributes} {...listeners} className="cursor-grab text-[var(--muted)] hover:text-[var(--fg)]"><GripVertical className="h-4 w-4" /></button>
      <input value={d.name} onChange={(e) => onUpdate(d.id, { name: e.target.value })} className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-1 text-sm outline-none hover:bg-[var(--surface-2)] focus:bg-[var(--surface-2)]" />
      <input value={d.url} onChange={(e) => onUpdate(d.id, { url: e.target.value })} className="hidden min-w-0 flex-[2] truncate rounded-md bg-transparent px-2 py-1 font-mono text-xs text-[var(--muted)] outline-none hover:bg-[var(--surface-2)] focus:bg-[var(--surface-2)] sm:block" title={d.url} />
      <input type="number" min={5} max={3600} value={d.duration} onChange={(e) => onUpdate(d.id, { duration: Number(e.target.value) })} className="w-16 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs" />
      <label className="inline-flex cursor-pointer items-center gap-1.5">
        <input type="checkbox" checked={d.active} onChange={(e) => onUpdate(d.id, { active: e.target.checked })} className="h-4 w-4 accent-[var(--primary)]" />
      </label>
      <button onClick={() => onRemove(d.id)} className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
    </li>
  );
}

function ConfigSection() {
  const [cfg, setCfg] = useState<DisplayConfig | null>(null);
  useEffect(() => { fetch("/api/config").then((r) => r.json()).then(setCfg); }, []);
  if (!cfg) return null;

  async function save() {
    await fetch("/api/config", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(cfg) });
    alert("Configuración guardada");
  }

  const set = (p: Partial<DisplayConfig>) => setCfg((c) => c ? { ...c, ...p } : c);

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">Configuración del display</h2>
      <div className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:grid-cols-2">
        <Field label="Resolución">
          <select value={cfg.resolution} onChange={(e) => set({ resolution: e.target.value })} className={inputCls}>
            <option>1920x1080</option><option>3840x2160</option><option>5760x1080</option><option>Personalizado</option>
          </select>
        </Field>
        <Field label="Zoom (%)"><input type="number" min={50} max={200} value={cfg.zoom} onChange={(e) => set({ zoom: Number(e.target.value) })} className={inputCls} /></Field>
        <Field label="Imagen de espera (URL)"><input value={cfg.fallbackImageUrl ?? ""} onChange={(e) => set({ fallbackImageUrl: e.target.value || null })} className={inputCls} /></Field>
        <Field label="Refresco automático (seg)">
          <select value={cfg.refreshInterval} onChange={(e) => set({ refreshInterval: Number(e.target.value) })} className={inputCls}>
            <option value={300}>5 min</option><option value={600}>10 min</option><option value={1800}>30 min</option><option value={0}>Desactivado</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <button onClick={save} className="rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--bg)] hover:opacity-90">Guardar y aplicar</button>
        </div>
      </div>
    </section>
  );
}

function DisplayUrlSection() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => { setUrl(`${window.location.origin}/display`); }, []);
  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">URL del display</h2>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md bg-[var(--surface-2)] px-3 py-2 font-mono text-xs">{url}</code>
          <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs hover:bg-[var(--surface)]">
            {copied ? <><Check className="h-3.5 w-3.5" /> Copiado</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">Configura esta URL en LG Supersign CMS.</p>
      </div>
    </section>
  );
}
