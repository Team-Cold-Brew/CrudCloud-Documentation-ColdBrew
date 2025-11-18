import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '🚀 Rápido y Simple',
    description: (
      <>
        Crea instancias de bases de datos en segundos. Sin configuración compleja,
        sin instalaciones manuales. Solo selecciona tu motor y empieza a trabajar.
      </>
    ),
  },
  {
    title: '🔐 Seguro por Defecto',
    description: (
      <>
        Credenciales generadas automáticamente, contraseñas hasheadas con BCrypt,
        y rotación de contraseñas con un click. Tu seguridad es nuestra prioridad.
      </>
    ),
  },
  {
    title: '🐳 Contenedores Docker',
    description: (
      <>
        Cada instancia corre en su propio contenedor Docker aislado. 
        Soportamos MySQL, PostgreSQL, MongoDB, Redis, Cassandra y SQL Server.
      </>
    ),
  },
  {
    title: '💳 Planes Flexibles',
    description: (
      <>
        Desde el plan FREE con 2 instancias hasta PREMIUM con 10 instancias.
        Actualiza o baja de plan cuando lo necesites con Mercado Pago.
      </>
    ),
  },
  {
    title: '📊 Dashboard Intuitivo',
    description: (
      <>
        Frontend moderno en React con TailwindCSS. Gestiona todas tus bases de datos
        desde un solo lugar con una interfaz responsive y accesible.
      </>
    ),
  },
  {
    title: '🔄 API REST Completa',
    description: (
      <>
        Backend robusto en Spring Boot con endpoints para crear, suspender, reanudar
        y eliminar instancias. Documentación completa con ejemplos.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
