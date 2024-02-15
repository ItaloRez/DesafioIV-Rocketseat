import { useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import commons from '../styles/common.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const fetchNextPage = async (nextPageUrl: string) => {
    const response = await fetch(nextPageUrl);
    const data = await response.json();
    const { results, next_page } = data;

    setNextPage(next_page);
    setPosts([...posts, ...results]);
  };

  return (
    <div className={commons.container}>
      <div className={styles.container}>
        <Header />
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <div key={post.uid} className={styles.postContainer}>
                <h1 className={styles.title}>{post.data.title}</h1>
                <p className={styles.subtitle}>{post.data.subtitle}</p>
                <div className={styles.infosPost}>
                  <div className={styles.tags}>
                    <FiCalendar color="#BBBBBB" size={20} />
                    <time className={styles.time}>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </time>
                  </div>
                  <div className={styles.tags}>
                    <FiUser color="#BBBBBB" size={20} />
                    <span className={styles.author}>{post.data.author}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {nextPage && (
            <div className={styles.buttonContainer}>
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  fetchNextPage(nextPage);
                }}
              >
                Carregar mais posts
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const getStaticProps = async (): Promise<{ props: HomeProps }> => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page || '',
        results: (postsResponse.results as undefined as Post[]) || [],
      },
    },
  };
};
