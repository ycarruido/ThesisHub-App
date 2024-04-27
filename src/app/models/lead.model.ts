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
	tema?: string;
    tipofuente?: string;
	tamanofuente?: string;
	interlineado?: string; 
    numero_paginas?: number;
    entregas?: number;
    descripcion?: string;
    fecha_inicio?: Date;
    fecha_entrega1?: Date;
	fecha_entrega2?: Date;
	fecha_entrega3?: Date;
	fecha_entrega4?: Date;
	
	country?: string = "";
	paisCode?: string;
	city?: string = "";
	sourse?: string;
	interests?: string;
	profile_picture?: string;
	registration_date?: Date;
	lastUpdate?: Date;
	lastUpdateLead?: string;
	state?: string;
	status?: boolean;
}
