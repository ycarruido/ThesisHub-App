export class LeadModel {
	uid? :string;
	id?: string;
  	name?: string;
	lastname?: string;
 	email?: string;
	tlf?: string;
	wapp?: string;
	university?: string;

	titulo?: string;
    bibliografia?: string;
    carrera?: string;
    especialidad?: string;
    numero_paginas?: number;
    entregas?: number;
    descripcion?: string;
    fecha_inicio?: Date;
    fecha_entrega?: Date;

	country?: string;
	city?: string;
	sourse?: string;
	interests?: string;
	profile_picture?: string;
	registration_date?: Date;
	lastUpdate?: Date;
	lastUpdateLead?: string;
	state?: string;
	status?: boolean;
}
