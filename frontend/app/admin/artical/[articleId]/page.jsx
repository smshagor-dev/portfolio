import ArticleEditorPage from "../article-editor-page";

export default async function AdminEditArticlePage({ params }) {
  const resolvedParams = await params;

  return <ArticleEditorPage articleId={resolvedParams.articleId} />;
}
