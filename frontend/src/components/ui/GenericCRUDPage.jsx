import { useState } from "react";

import PageHeader from "./PageHeader";
import DataTable from "./DataTable";
import StatusBadge from "./StatusBadge";
import Modal from "./Modal";

/**
 * GenericCRUDPage — reusable template for Modules / Topics / Videos / Quizzes / Simulations
 * Props:
 *   title       string
 *   subtitle    string
 *   apiBase     string  e.g. "/api/modules"
 *   fields      Array<{ key, label, type?, options? }>
 *   mockData    Array<object>
 */
export default function GenericCRUDPage({ title, subtitle, apiBase, fields, mockData }) {
  const [items, setItems] = useState(mockData);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const filtered = items.filter((item) =>
    fields.some((f) =>
      String(item[f.key] || "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const openCreate = () => {
    setEditing(null);
    setForm({});
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...item });
    setOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setItems((prev) =>
        prev.map((i) => (i.id === editing.id ? { ...i, ...form } : i))
      );
    } else {
      const newItem = {
        id: Date.now(),
        ...form,
        status: "Active",
        created: new Date().toISOString().split("T")[0],
      };
      setItems((prev) => [newItem, ...prev]);
    }

    setOpen(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this item?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const columns = [
    ...fields.slice(0, 3).map((f) => ({ key: f.key, label: f.label })),
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status || "Active"} />,
    },
    { key: "created", label: "Created" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(r)}
            className="text-xs text-blue-600 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="text-xs text-rose-600 font-medium border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center gap-2"
          >
            <span>+</span> Create {title.replace(" Management", "")}
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Demo mode: this management page is currently using mock data and is not yet connected to the backend.
        </div>

        <div className="mb-5">
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage={`No ${title.toLowerCase()} found.`}
        />
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={
          editing
            ? `Edit ${title.replace(" Management", "")}`
            : `Create ${title.replace(" Management", "")}`
        }
      >
        <div className="space-y-4">
          {fields.map(({ key, label, type = "text", options }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {label}
              </label>

              {options ? (
                <select
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-all"
                >
                  <option value="">Select {label}</option>
                  {options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : type === "textarea" ? (
                <textarea
                  rows={3}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              ) : (
                <input
                  type={type}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              {editing ? "Save Changes" : "Create"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}