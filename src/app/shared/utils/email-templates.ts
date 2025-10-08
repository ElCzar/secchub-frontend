export const EMAIL_TEMPLATES = {
  docentes: {
    title: 'Enviar formulario confirmación docente',
    subject: 'Confirmación de disponibilidad docente - PUJ',
    message: `Estimado/a Docente,

Cordial saludo. Me comunico con usted para solicitar la confirmación respecto a las asignaturas que se le han asignado en el próximo semestre.
Por favor, ingrese al siguiente enlace para confirmar su disponibilidad:
http://localhost:4200/FormularioConfirmacionDocentes

Agradecemos su colaboración en este proceso que nos permite garantizar una adecuada planificación académica.`
  },

  monitores: {
    title: 'Enviar formulario convocatoria monitores',
    subject: 'Convocatoria monitores - Departamento de Ingeniería de Sistemas',
    message: `Estimados estudiantes,

Cordial saludo. Nos permitimos compartir el link del formulario para la convocatoria de monitores del Departamento de Ingeniería de Sistemas.
Si desean postularse, por favor diligencien el siguiente formulario antes de la fecha indicada:
http://localhost:4200/FormularioMonitores`
  },

  programas: {
    title: 'Enviar formulario a los programas',
    subject: 'Formulario de planificación académica - Programas',
    message: `Buen día,

Desde el Departamento de Ingeniería de Sistemas, nos permitimos enviar el formulario oficial de planificación de materias correspondiente al próximo semestre académico.

Acceda al formulario en el siguiente enlace:
http://localhost:4200/FormularioProgramas`
  }
};
