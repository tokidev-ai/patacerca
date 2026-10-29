export const APP_STRINGS = {
  errors: {
    invalidBolivianPhone: 'Ingresa un número de Bolivia: 8 dígitos, empieza con 6 o 7',
    invalidOtp: 'Código incorrecto. Prueba con 1234',
    missingOwnerFields: 'Completa tu nombre y el de tu perro',
    missingWalkerFields: 'Escribe tu nombre y apellido (mínimo 2 palabras)',
    missingTimeSlot: 'Elige una hora',
    missingVerificationStep1: 'Completa el número de carnet y las tres fotos',
    missingVerificationStep2: 'Sube tu certificado',
    missingVerificationStep3: 'Completa ambas referencias con números válidos',
    missingVerificationStep4: 'Elige un horario',
    incompleteVerification: 'Completa los 4 pasos para enviar',
    verificationRequiredToAccept: 'Necesitas estar verificado para aceptar paseos',
  },
  toasts: {
    welcomeBack: (name: string) => `Bienvenido de nuevo, ${name}`,
    requestSent: (name: string) => `Solicitud enviada a ${name}. Te avisaremos cuando responda.`,
    verificationSent: 'Verificación enviada. Te avisaremos por WhatsApp.',
    verificationApproved: '¡Verificación aprobada! Ya puedes aceptar paseos.',
    walkAccepted: (name: string) => `Paseo aceptado. Escríbele a ${name} para coordinar.`,
    walkCancelled: 'Solicitud cancelada.',
    walkCompleted: 'Paseo marcado como completado.',
    walkRated: '¡Gracias por calificar el paseo!',
  },
  chat: {
    disclaimer: 'Por tu seguridad, coordina y paga dentro de Patacerca.',
    walkerAdvice: 'Comparte fotos y la ruta al terminar cada paseo.',
    autoReply: (ownerName: string, walkerName: string, dogName: string) =>
      `¡Hola ${ownerName}! Soy ${walkerName}. Con gusto paseo a ${dogName}. ¿Qué horario te sirve?`,
  },
} as const;

