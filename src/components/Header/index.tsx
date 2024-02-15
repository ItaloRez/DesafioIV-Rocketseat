import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.container}>
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="logo"
          width={0}
          height={0}
          className={styles.image}
          sizes="100vw"
        />
      </Link>
    </div>
  );
}
