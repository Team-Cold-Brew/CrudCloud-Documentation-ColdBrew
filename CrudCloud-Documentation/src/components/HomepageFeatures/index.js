import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '🚀 Fast and Simple',
    description: (
      <>
        Create database instances in seconds. No complex configuration,
        no manual installations. Just select your engine and start working.
      </>
    ),
  },
  {
    title: '🔐 Secure by Default',
    description: (
      <>
        Auto-generated credentials, BCrypt hashed passwords,
        and one-click password rotation. Your security is our priority.
      </>
    ),
  },
  {
    title: '🐳 Docker Containers',
    description: (
      <>
        Each instance runs in its own isolated Docker container. 
        We support MySQL, PostgreSQL, MongoDB, Redis, Cassandra and SQL Server.
      </>
    ),
  },
  {
    title: '💳 Flexible Plans',
    description: (
      <>
        From FREE plan with 2 instances to PREMIUM with 10 instances.
        Upgrade or downgrade whenever you need with Mercado Pago.
      </>
    ),
  },
  {
    title: '📊 Intuitive Dashboard',
    description: (
      <>
        Modern React frontend with TailwindCSS. Manage all your databases
        from one place with a responsive and accessible interface.
      </>
    ),
  },
  {
    title: '🔄 Complete REST API',
    description: (
      <>
        Robust Spring Boot backend with endpoints to create, suspend, resume
        and delete instances. Full documentation with examples.
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
