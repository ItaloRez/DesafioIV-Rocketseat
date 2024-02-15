import Image from 'next/image';
import { format } from 'date-fns';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { PrismicRichText } from '@prismicio/react';

import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import commons from '../../styles/common.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const formmatedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy'
  );

  const totalWords = post.data.content.reduce((acc, content) => {
    const words = content.heading.split(' ').length;

    const bodyWords = content.body.reduce((accBody, body) => {
      const wordsBody = body.text.split(' ').length;
      return accBody + wordsBody;
    }, 0);

    return acc + words + bodyWords;
  }, 0);

  const readingTime = Math.ceil(totalWords / 200);

  return (
    <>
      <div className={commons.container}>
        <Header />
      </div>
      <Image
        src={post.data.banner.url}
        alt="banner"
        width={0}
        height={0}
        // className={styles.image}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        sizes="100vw"
      />
      <div className={styles.container}>
        <h1>{post.data.title}</h1>
        <div className={styles.info}>
          <div className={styles.item}>
            <FiCalendar />
            <time>{formmatedDate}</time>
          </div>
          <div className={styles.item}>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div className={styles.item}>
            <FiClock />
            <span>{readingTime} min</span>
          </div>
        </div>
        <div className={styles.content}>
          {post.data.content.map(content => (
            <div key={content.heading}>
              <h2>{content.heading}</h2>
              <br />

              <PrismicRichText
                field={content.body as any}
                fallback={<p>No content</p>}
                components={{
                  preformatted: ({ children }) => <p>{children}</p>,
                }}
              />
              <br />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(params.slug));

  return {
    props: {
      post: response,
    },
  };
};
