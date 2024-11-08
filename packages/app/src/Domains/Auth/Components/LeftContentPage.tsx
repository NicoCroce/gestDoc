import { Container, Title } from '@app/Aplication';

import img from '@app/Aplication/Images/icon-192x192.png';

export const LeftContentPage = () => {
  return (
    <Container
      block
      className="h-full md:p-10 after:absolute after:top-0 after:bottom-0 after:left-0 after:right-0 after:backdrop-blur-sm md:mt-[30dvh]"
    >
      <Container row align="center" className="relative z-10 m-6 mb-10">
        <img src={img} width={50} className="rounded-full md:w-[152px]" />
        <Container space="none">
          <Title className="text-white">GestDoc</Title>
          <Title variant="h2" className="text-secondary">
            Macrosistemas
          </Title>
        </Container>
      </Container>
    </Container>
  );
};
