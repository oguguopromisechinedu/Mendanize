import { redirect } from "next/navigation"

/** Legacy blog archive — articles live at /articles (MES-025). */
export default function BlogArchivePage() {
  redirect("/articles")
}
