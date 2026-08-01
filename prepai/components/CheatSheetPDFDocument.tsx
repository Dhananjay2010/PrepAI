import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import { QuestionData } from "./QuestionCard";

interface CheatSheetPDFProps {
  roleSummary: string;
  seniority: string;
  keySkills: string[];
  questions: QuestionData[];
  prepTips?: string[];
  createdDate?: string;
  interviewDate?: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 44,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    fontSize: 9,
    color: "#1e293b",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#0f172a",
    paddingBottom: 10,
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  logoGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: 7.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 8,
    color: "#64748b",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 3,
  },
  seniorityTag: {
    fontSize: 7.5,
    color: "#1d4ed8",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  targetDateTag: {
    fontSize: 8,
    color: "#92400e",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    fontWeight: "bold",
  },

  // Section Headers
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  // Quick Revision Section
  revisionContainer: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    gap: 16,
  },
  revisionCol: {
    flex: 1,
  },
  subHeading: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  bulletItem: {
    fontSize: 8,
    color: "#334155",
    marginBottom: 3,
    lineHeight: 1.3,
  },

  // Terms Section
  termsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 10,
  },
  termPill: {
    backgroundColor: "#f1f5f9",
    borderColor: "#94a3b8",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
  },

  // Question Cards
  questionCard: {
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
    padding: 9,
    marginBottom: 9,
    backgroundColor: "#ffffff",
  },
  qHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  qNumBadge: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  categoryBadge: {
    fontSize: 7.5,
    color: "#1d4ed8",
    backgroundColor: "#eff6ff",
    fontWeight: "bold",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  questionText: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 6,
    lineHeight: 1.3,
  },

  // Precise Answer Box
  preciseAnswerBox: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
    borderRadius: 5,
    padding: 7,
  },
  answerHeader: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#047857",
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  answerSummary: {
    fontSize: 8.5,
    color: "#064e3b",
    fontWeight: "bold",
    marginBottom: 3,
    lineHeight: 1.3,
  },
  sampleAnswerText: {
    fontSize: 8,
    color: "#065f46",
    fontStyle: "italic",
    backgroundColor: "#ffffff",
    padding: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#d1fae5",
    lineHeight: 1.3,
  },

  // Recommended Learning Links
  linksBox: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#a7f3d0",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  learningLink: {
    fontSize: 7.5,
    color: "#1d4ed8",
    backgroundColor: "#ffffff",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    textDecoration: "none",
    fontWeight: "bold",
  },

  // Outline Box
  outlineAnswerBox: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 5,
    padding: 7,
  },
  outlineHeader: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  outlineText: {
    fontSize: 8,
    color: "#334155",
    lineHeight: 1.3,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 16,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 7.5,
    color: "#94a3b8",
  },
});

export function CheatSheetPDFDocument({
  roleSummary,
  seniority,
  keySkills,
  questions,
  prepTips = [],
  createdDate,
  interviewDate,
}: CheatSheetPDFProps) {
  const importantTerms =
    keySkills && keySkills.length > 0
      ? keySkills
      : ["System Design", "Scalability", "Concurrency", "Database Indexing", "API Security"];

  return (
    <Document title={`${roleSummary} Interview Cheat Sheet`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoGroup}>
              <Text style={styles.logo}>PrepAI</Text>
              <Text style={styles.badge}>EXECUTIVE INTERVIEW CHEAT SHEET</Text>
            </View>
            <Text style={styles.dateText}>
              Generated: {createdDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </Text>
          </View>

          <View style={styles.titleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.seniorityTag}>{(seniority || "Engineer").toUpperCase()}</Text>
              <Text style={styles.title}>{roleSummary || "Software Engineering Role"}</Text>
            </View>

            {interviewDate && (
              <Text style={styles.targetDateTag}>
                Target Interview: {new Date(interviewDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* SECTION 1: QUICK REVISION SHEET */}
        <Text style={styles.sectionTitle}>1. QUICK REVISION SHEET</Text>
        <View style={styles.revisionContainer}>
          <View style={styles.revisionCol}>
            <Text style={styles.subHeading}>Preparation Takeaways:</Text>
            {prepTips && prepTips.length > 0 ? (
              prepTips.slice(0, 3).map((tip, i) => (
                <Text key={i} style={styles.bulletItem}>
                  • {tip}
                </Text>
              ))
            ) : (
              <>
                <Text style={styles.bulletItem}>• State time & space complexity before presenting code.</Text>
                <Text style={styles.bulletItem}>• Highlight production resilience and architectural trade-offs.</Text>
              </>
            )}
          </View>

          <View style={styles.revisionCol}>
            <Text style={styles.subHeading}>Spoken Answer Strategy:</Text>
            <Text style={styles.bulletItem}>• Structure: Executive Answer → Trade-off → Production Result.</Text>
            <Text style={styles.bulletItem}>• Keep verbal responses between 90 and 150 seconds.</Text>
          </View>
        </View>

        {/* SECTION 2: TERMS TO REMEMBER */}
        <Text style={styles.sectionTitle}>2. TERMS TO REMEMBER</Text>
        <View style={styles.termsContainer}>
          {importantTerms.map((term, idx) => (
            <Text key={idx} style={styles.termPill}>
              {term}
            </Text>
          ))}
        </View>

        {/* SECTION 3: QUESTIONS & MODEL ANSWERS */}
        <Text style={styles.sectionTitle}>
          3. QUESTIONS & MODEL ANSWERS ({questions.length})
        </Text>
        <View>
          {questions.map((q, idx) => {
            const links = q.precise_answer?.recommended_reading?.length
              ? q.precise_answer.recommended_reading
              : [
                  {
                    title: `Docs: ${q.category}`,
                    url: `https://www.google.com/search?q=${encodeURIComponent(q.category + " " + q.question + " documentation")}`,
                  },
                ];

            return (
              <View key={idx} style={styles.questionCard} wrap={false}>
                <View style={styles.qHeader}>
                  <Text style={styles.qNumBadge}>Q{q.num || idx + 1}</Text>
                  <Text style={styles.categoryBadge}>{q.category}</Text>
                </View>

                <Text style={styles.questionText}>{q.question}</Text>

                {q.precise_answer ? (
                  <View style={styles.preciseAnswerBox}>
                    <Text style={styles.answerHeader}>✨ PRECISE VERBAL MODEL ANSWER</Text>
                    <Text style={styles.answerSummary}>"{q.precise_answer.summary_statement}"</Text>
                    {q.precise_answer.sample_spoken_answer && (
                      <Text style={styles.sampleAnswerText}>
                        "{q.precise_answer.sample_spoken_answer}"
                      </Text>
                    )}

                    {/* Vector Clickable Links in PDF */}
                    {links && links.length > 0 && (
                      <View style={styles.linksBox}>
                        <Text style={{ fontSize: 7, color: "#047857", fontWeight: "bold" }}>
                          Deep-Dive Web Links:
                        </Text>
                        {links.map((item, lIdx) => (
                          <Link key={lIdx} src={item.url} style={styles.learningLink}>
                            🔗 {item.title}
                          </Link>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.outlineAnswerBox}>
                    <Text style={styles.outlineHeader}>MODEL ANSWER OUTLINE</Text>
                    <Text style={styles.outlineText}>{q.strong_answer_outline}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Fixed Page Footer */}
        <View style={styles.footer} fixed>
          <Text>Prepared with PrepAI Technical Interview Coach</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          <Text>https://prepai.com</Text>
        </View>
      </Page>
    </Document>
  );
}
