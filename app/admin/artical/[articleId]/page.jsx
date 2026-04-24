import ArticleEditorPage from "../article-editor-page";

export default function AdminEditArticlePage({ params }) {
  return <ArticleEditorPage articleId={params.articleId} />;
}
