interface IAddLincence {
  currentUser: string;
  reason: string;
}

interface ISignDocument {
  currentUser: string;
  reason: string;
  documentId: number;
}

const addLicense = ({ currentUser, reason }: IAddLincence) => ({
  subject: `[Aviso] Gestdoc - Nueva licencia de ${currentUser}`,
  body: `<h1> Nueva licencia</h1> 
              <p>El empleado <strong> ${currentUser} </strong> agregó una licencia<p>
              <h2>Descripción de la licencia</h2>
              <p>${reason}</p>
              <hr>
              <p>Este mail fue enviado de forma automática por <strong><a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow">GestDoc</a></strong></p>
              `,
});

interface IDisclaimerReminder {
  employeeName: string;
  disclaimerText: string;
  companyName: string;
}

const signDocument = ({ currentUser, reason, documentId }: ISignDocument) => ({
  subject: `[Aviso] Gestdoc - Firma bajo no conformidad de ${currentUser}`,
  body: `<h1> Nueva firma bajo no conformidad</h1> 
              <p>El empleado <strong>${currentUser}</strong> firmó el documento ${documentId} <p>
              <h2>Motivo de la firma</h2>
              <p>${reason}</p>
              <hr>
              <p>Este mail fue enviado de forma automática por <strong> <a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow">GestDoc</a></strong></p>
              `,
});

const disclaimerReminder = ({
  employeeName,
  disclaimerText,
  companyName,
}: IDisclaimerReminder) => ({
  subject: `[GestDoc] Recordatorio de firma de términos - ${companyName}`,
  body: `<h1>Recordatorio de firma de términos</h1>
              <p>Hola <strong>${employeeName}</strong>,</p>
              <p>Este es un recordatorio de que aún no ha firmado los términos y condiciones de <strong>${companyName}</strong> en GestDoc.</p>
              <p>Al ingresar nuevamente a la plataforma, se le solicitará que acepte los términos.</p>
              <h2>Texto de los términos:</h2>
              <blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin: 16px 0; color: #555;">
                ${disclaimerText}
              </blockquote>
              <hr>
              <p>Este mail fue enviado de forma automática por <strong><a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow">GestDoc</a></strong></p>
              `,
});

export const emailTemplates = {
  addLicense,
  signDocument,
  disclaimerReminder,
};
