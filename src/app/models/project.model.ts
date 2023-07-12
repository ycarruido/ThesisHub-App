export class ProjectModel {
	uid? :string;
    project_id?: string;
    client_id?: string;
    titulo?: string;
    bibliografia?: string;
    carrera?: string;
    especialidad?: string;
    tema?: string;
    universidad?: string;
    numero_paginas?: number;
    entregas?: number;
    descripcion?: string;
    fecha_inicio?: Date;
    fecha_entrega?: Date;
    presupuesto?: number;
    monto_recibido?: number;
    porcentaje_a_realizar?: number;
    ultima_entrega?: Date;
    fecha_proxima?: Date;
    factura?: string;
    registration_date?: Date;
    lastUpdate?: Date;
	lastUpdateUser?: string;
    status?: boolean;
    state?: string;
}
