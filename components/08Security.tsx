import React from 'react';
import { motion } from 'framer-motion';
import { Server, ShieldCheck, FileCheck, Award, LockKeyhole } from 'lucide-react';

export const Security: React.FC = () => {
  const cards = [
    {
      icon: ShieldCheck,
      title: "Seguridad Industrial",
      desc: "Datos operativos protegidos end-to-end. La información de campo y producción no se utiliza para entrenar modelos públicos."
    },
    {
      icon: Server,
      title: "Infraestructura OT/IT",
      desc: "Despliegue on-premise, nube privada o arquitectura híbrida según criticidad, continuidad operativa y políticas internas."
    },
    {
      icon: FileCheck,
      title: "Gobernanza y Compliance",
      desc: "Alineamiento con estándares corporativos, auditoría de datos, trazabilidad de decisiones y requisitos regulatorios del sector industrial."
    },
    {
      icon: Award,
      title: "Calidad Internacional",
      desc: "Prácticas de arquitectura, control continuo y gestión de riesgo acordes a las empresas industriales más importantes del mundo."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
  };

  return (
    <section className="py-24 bg-[#001C2E] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#00B5E2]/12 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#F2F2F2]/8 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00B5E2]/12 text-[#00B5E2] text-sm font-bold tracking-wide uppercase mb-6 shadow-sm">
              <LockKeyhole size={16} className="text-[#00B5E2]" />
              Industrial Grade Security
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
              Estándares de<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B5E2] to-[#F2F2F2]">
                Calidad y Seguridad
              </span>
            </h2>
            <p className="text-lg text-[#F2F2F2]/80 mb-8 leading-relaxed font-light">
              Con sede central en Londres, Ai Workify trabaja con organizaciones que operan entornos críticos y altamente regulados. Nuestra arquitectura de datos, seguridad y gobierno de IA está diseñada para cumplir con estándares de calidad propios del sector industrial, integrándose con políticas corporativas de ciberseguridad, continuidad operativa, HSE, OT e IT. El modelo de implementación prioriza trazabilidad, control de acceso, protección de información sensible y cumplimiento normativo local, para acompañar a Pluspetrol con el nivel de rigor requerido por las compañías industriales más importantes del mundo.
            </p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00B5E2]/10 to-transparent rounded-3xl -z-10 blur-xl"></div>
            {cards.map((item, idx) => (
              <motion.div 
                key={idx} 
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-[#F2F2F2]/6 backdrop-blur-md border border-[#F2F2F2]/12 hover:border-[#00B5E2]/55 rounded-2xl p-6 transition-all duration-300 shadow-xl shadow-black/20 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B5E2]/12 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-12 h-12 rounded-xl bg-[#00B5E2]/12 border border-[#00B5E2]/35 flex items-center justify-center shrink-0 text-[#00B5E2] mb-5 group-hover:scale-110 transition-transform duration-500 group-hover:text-[#F2F2F2] group-hover:border-[#F2F2F2]/45 group-hover:bg-[#00B5E2]/22">
                  <item.icon size={24} strokeWidth={1.5} />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-[#F2F2F2]/65 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
