export class InvoiceModel {
    uid?: string;
    invoice_id? :string;
    numeroFactura? :string;
    fechaEmision?: Date;
    montoTotal?: number;
    subtotal?: number;
    impuestos?: number;
    paymentMethod?: string;
    project_id? :string;
	nombreProyecto? :string;
    client_id? :string;
    nombreCliente? :string;
    registration_date?: Date;
    lastUpdate?: Date;
    lastUpdateUser?: string;
    ruta_doc?: string;
    notas?: string;
    status? :string; /* Pendiente, En revisión, Aprobada, Rechazada, Enviada al cliente, Vencida, Cancelada, Eliminada */
}