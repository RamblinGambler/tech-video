import type { NextPage } from 'next'
import { prisma } from 'utils/prisma'
import { useSession, signIn, signOut } from "next-auth/react"
import { GetServerSideProps } from 'next'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from "next-auth/next"
import type { Session } from 'next-auth'
import type { Course, Lesson } from '@prisma/client'
import Link from 'next/link'

type AdminCourseEditPageProps = {
  session: Session;
  course: (Course & {
    lessons: Lesson[];
  });
}

const AdminCourseEdit: NextPage<AdminCourseEditPageProps> = ({ course }) => {
  const { data: session } = useSession()

  if (session) {
    return (
      <>
        <h2 className='text-xl'>{course.name}</h2>
        <h3>Lessons</h3>
        {course.lessons.length > 0 ? (
          <>
            {
              course.lessons.map(lesson => (
                <div key={lesson.id}>

                  <Link href={`/admin/courses/${course.id}/lessons/${lesson.id}`}>
                    <a className='underline'>{lesson.name}</a>
                  </Link>
                </div>
              ))
            }
          </>
        ) : (
          <div>
            <h2>None yet.</h2>
          </div>
        )}

        <Link href={`/admin/courses/${course.id}/lessons/new`}>
          <a className='underline'>Add a lesson</a>
        </Link>
      </>
    )
  }
  return <p>Access Denied</p>
}

export default AdminCourseEdit

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const id = context?.params?.courseId
  if (typeof id !== "string") { throw new Error('missing id') };

  const [course] = await prisma.course.findMany({
    where: {
      id: parseInt(id),
      author: {
        email: session.user?.email
      }
    },
    include: {
      lessons: true,
    },
  })

  if (!course) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      session,
      course
    },
  }
}