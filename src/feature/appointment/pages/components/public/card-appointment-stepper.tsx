interface Props {
  form: any;
}

export default function AppointmentStepper({ form }: Props) {
  const steps = ["Empresa", "Serviço", "Data", "Horário", "Seus dados"];

  const completedSteps = [
    !!form.companyId,
    !!form.serviceId,
    !!form.preferredDate,
    !!form.preferredTime,
    !!form.clientName,
  ];

  return (
    <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const isActive = completedSteps[index];
        const isLast = index === steps.length - 1;

        return (
          <div key={step} className="flex items-center gap-1 min-w-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0 transition-all duration-300
                  ${isActive
                    ? "text-white public-selected-shadow"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                style={isActive ? {
                  background: "var(--brand-gradient-main)",
                } : undefined}
              >
                {index + 1}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${isActive ? "public-brand-text" : "text-slate-400"}`}>
                {step}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 w-6 sm:w-10 rounded-full mb-4 shrink-0 transition-all duration-300 ${isActive ? "public-brand-dot" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
