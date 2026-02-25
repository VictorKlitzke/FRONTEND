import { Briefcase } from "lucide-react";

export const RegisterHeroPanel = () => {
    return (
        <div className="hidden lg:flex flex-col items-center justify-center bg-[#0f1e4a] text-white px-10">
            <div className="max-w-md text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
                    <Briefcase className="h-6 w-6" />
                </div>

                <h2 className="text-3xl font-bold">
                    Gerencie seus agendamentos com facilidade
                </h2>

                <p className="text-white/80">
                    Centralize agenda, serviços e clientes em um único lugar.
                    Simplifique sua gestão e foque no crescimento do seu negócio.
                </p>
            </div>
        </div>
    );
};