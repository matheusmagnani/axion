import { Gear } from '@phosphor-icons/react';
import { PageHeader } from '@shared/components/PageHeader/PageHeader';
import { CompanyInfoSection } from '../components/CompanyInfoSection';

export function SettingsPage() {
  return (
    <div className="flex flex-col h-full px-2 md:px-4 lg:px-[25px] py-2 md:py-4 lg:py-[25px] w-full">
      {/* Header */}
      <div className="flex-shrink-0">
        <PageHeader
          title="Configurações"
          icon={Gear}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 mt-2 overflow-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-6 py-4">
          {/* Módulo: Informações da Empresa */}
          <CompanyInfoSection />

          {/* Placeholder para futuros módulos */}
          <div className="bg-app-primary/50 rounded-2xl border border-dashed border-app-secondary/20 p-8 text-center">
            <p className="text-app-gray">
              Mais configurações em breve: Produtos, Permissões, Setores...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
