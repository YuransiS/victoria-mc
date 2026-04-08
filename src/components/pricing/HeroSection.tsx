export const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen bg-[#0e0e0e] flex items-center overflow-hidden">
      {/* Background image placeholder / overlay */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        {/* Placeholder for the cinematic image */}
        <div className="absolute inset-0 bg-[#0e0e0e] opacity-50" />
      </div>

      <div className="relative z-20 container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row justify-between items-start lg:items-center w-full">
        {/* Left side: Typography */}
        <div className="flex-1 w-full flex flex-col justify-center mt-24 lg:mt-0">
          <p className="font-inter text-sm text-[#9e9e9e] mb-6 tracking-widest uppercase">
            01 / КОНЦЕПТ
          </p>
          <h1 className="font-manrope text-5xl md:text-7xl lg:text-[5rem] text-[#c6c6c7] leading-[1.1] font-bold uppercase tracking-tight">
            Створюй
            <span className="block text-3xl md:text-5xl lg:text-[3rem] mt-4 opacity-80">
              Візуал. Сенси. Контент.
            </span>
          </h1>
        </div>

        {/* Right side: Editorial Copy */}
        <div className="flex-1 w-full lg:w-1/2 flex justify-end mt-16 lg:mt-0">
          <div className="max-w-md text-right">
            <p className="font-inter text-base md:text-lg text-[#e0e0e0] leading-[1.6]">
              Забудь про хаос в блозі.
              <br />
              <br />
              Побудуй для себе зручну систему роботи з контентом та візуалом вже з першого тижня навчання.
              <br />
              <br />
              Без фотостудій, складних зйомок і дорогого обладнання.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom left detail */}
      <div className="absolute bottom-8 left-6 lg:left-12 z-20">
        <p className="font-inter text-sm text-[#9e9e9e]">
          Тривалість: 7 тижнів / Формат: Online
        </p>
      </div>
    </section>
  );
};
