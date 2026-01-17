import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Select } from "../../../components/ui/Select";

export default function TemplateFormModal({
  open,
  mode,
  formData,
  setFormData,
  dataSources = [],
  saving,
  onSave,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Nuevo Certificado" : "Configurar Plantilla"}
      size="sm"
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
        },
        {
          label: saving
            ? mode === "create"
              ? "Creando..."
              : "Guardando..."
            : mode === "create"
              ? "Crear y Diseñar"
              : "Guardar Cambios",
          variant: "primary",
          onClick: onSave,
          disabled: saving,
        },
      ]}
    >
      <div className="space-y-4">
        {mode === "create" ? (
          <>
            <Input
              label="Nombre certificado"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Certificado de Transporte"
            />
            <div>
              <Textarea
                label={'Descripción'}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Descripción de la plantilla..."
                className="w-full"
              />
            </div>
            <Select
              label="Origen de Datos"
              value={formData.data_source_id || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, data_source_id: value ? parseInt(value) : null });
              }}
              hint="Selecciona la fuente de datos SQL para las variables del certificado"
            >
              <option value="">Sin origen de datos</option>
              {dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.code})
                </option>
              ))}
            </Select>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Nombre"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Certificado de Transporte"
              />
            </div>
            <div>
              <Textarea
                label={'Descripción'}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Descripción de la plantilla..."
                className="w-full"
              />
            </div>
            <Select
              label="Origen de Datos"
              value={formData.data_source_id || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, data_source_id: value ? parseInt(value) : null });
              }}
              hint="Fuente de datos SQL para las variables del certificado"
            >
              <option value="">Sin origen de datos</option>
              {dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.code})
                </option>
              ))}
            </Select>
            <Select
              label="Estado"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </Select>
          </>
        )}
      </div>
    </Modal>
  );
}
