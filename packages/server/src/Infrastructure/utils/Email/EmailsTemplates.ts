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

export const emailTemplates = {
  addLicense,
  signDocument,
};
