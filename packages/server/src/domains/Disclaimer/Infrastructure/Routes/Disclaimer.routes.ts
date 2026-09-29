import { disclaimerController } from '../..';

export const DisclaimerRoutes = () => {
  const { getText, sign, getStatus, getEmployees, sendReminders, hasText } =
    disclaimerController();

  return {
    disclaimer: {
      getText: getText(),
      sign: sign(),
      getStatus: getStatus(),
      getEmployees: getEmployees(),
      sendReminders: sendReminders(),
      hasText: hasText(),
    },
  };
};
