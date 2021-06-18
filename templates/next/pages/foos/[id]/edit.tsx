import { GetStaticPaths, GetStaticProps, NextComponentType, NextPageContext } from "next";
import { Form } from "../../../components/{{{lc}}}/Form";
import { {{{ucf}}} } from "../../../types/{{{ucf}}}";
import { fetch } from "../../../utils/dataAccess";
import Head from "next/head";
import DefaultErrorPage from "next/error";

interface Props {
  {{{lc}}}: {{{ucf}}};
};

const Page: NextComponentType<NextPageContext, Props, Props> = ({ {{{lc}}} }) => {
  if (!{{{lc}}}) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <div>
      <div>
        <Head>
          <title>{{{{lc}}} && `Edit {{{ucf}}} ${{{~lc}}['@id']}`}</title>
        </Head>
      </div>
      <Form {{{lc}}}={{{{lc}}}} />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  return {
    props: {
      {{{lc}}}: await fetch(`/{{{name}}}/${params.id}`),
    },
    revalidate: 1,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const response = await fetch("/{{{name}}}");

    return {
      paths: response.data["hydra:member"].map(({{{lc}}}) => `${{{{lc}}}['@id']}/edit`),
      fallback: true,
    };
  } catch (e) {
    console.error(e);
  }

  return {
    paths: [],
    fallback: true,
  };
}

export default Page;
