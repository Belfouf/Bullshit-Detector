function analyzeText(text) {
  const gradeToPoints = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };

  const textAnalysis = {
    // Language-agnostic word statistics
    getWordStats(text) {
      const words = text.match(/[\p{L}\p{N}]+/gu) || [];
      const uniqueWords = new Set(words);
      return {
        total: words.length,
        unique: uniqueWords.size,
        ratio: uniqueWords.size / words.length,
        frequency: words.reduce((acc, word) => {
          acc[word.toLowerCase()] = (acc[word.toLowerCase()] || 0) + 1;
          return acc;
        }, {})
      };
    },

    // Language-agnostic sentence complexity
    getSentenceComplexity(text) {
      const sentences = text.match(/[^!?。．？！\n]+[!?。．？！\n]+/gu) || [];
      return sentences.map(sentence => {
        const words = sentence.match(/[\p{L}\p{N}]+/gu) || [];
        const punctuation = (sentence.match(/[,;:，；：]/gu) || []).length;
        const parenthetical = (sentence.match(/[\(\[\{][^\)\]\}]+[\)\]\}]/gu) || []).length;
        return {
          length: words.length,
          punctuation,
          parenthetical,
          complexity: words.length * (1 + punctuation/5 + parenthetical/2)
        };
      });
    },

    // Analyze impact patterns
    getImpactLevel(text) {
      const patterns = {
        directLife: /\b(health|safety|rights|education|life|death|emergency|crisis)\b/iu,
        systemic: /\b(system|policy|law|regulation|government|reform|change)\b/iu,
        indirect: /\b(community|social|culture|influence|affect)\b/iu,
        local: /\b(local|city|town|district|neighborhood)\b/iu
      };

      const matches = Object.entries(patterns).reduce((acc, [key, pattern]) => {
        acc[key] = (text.match(pattern) || []).length;
        return acc;
      }, {});

      // Calculate impact score
      const score = matches.directLife * 3 + 
                   matches.systemic * 2 + 
                   matches.indirect * 1.5 + 
                   matches.local;

      if (score > 10) return 'A';
      if (score > 7) return 'B';
      if (score > 5) return 'C';
      if (score > 3) return 'D';
      return 'E';
    },

    // Analyze temporal relevance
    getTemporalRelevance(text) {
      const patterns = {
        longTerm: /\b(future|permanent|lasting|years|decade|generation)\b/iu,
        mediumTerm: /\b(month|quarterly|annual|upcoming|plan)\b/iu,
        current: /\b(current|ongoing|present|now|today)\b/iu,
        shortTerm: /\b(week|day|temporary|immediate)\b/iu
      };

      const matches = Object.entries(patterns).reduce((acc, [key, pattern]) => {
        acc[key] = (text.match(pattern) || []).length;
        return acc;
      }, {});

      const score = matches.longTerm * 3 + 
                   matches.mediumTerm * 2 + 
                   matches.current * 1.5 + 
                   matches.shortTerm;

      if (score > 8) return 'A';
      if (score > 6) return 'B';
      if (score > 4) return 'C';
      if (score > 2) return 'D';
      return 'E';
    },

    // Analyze dialectical quality
    getDialecticalQuality(text) {
      const questions = (text.match(/\b(why|how|what if|analyze|examine)\b/iu) || []).length;
      const complexity = this.getSentenceComplexity(text);
      const avgComplexity = complexity.reduce((sum, s) => sum + s.complexity, 0) / complexity.length;
      
      return {
        questionScore: questions * 2 + avgComplexity,
        argumentScore: complexity.filter(s => s.complexity > 15).length
      };
    },

    // Analyze social reasoning
    getSocialReasoning(text) {
      const patterns = {
        multipleViews: /\b(however|but|although|contrary|oppose|support|agree)\b/iu,
        groupPerspectives: /\b(group|community|society|people|public|population)\b/iu,
        powerRelations: /\b(authority|power|control|influence|leadership|position)\b/iu
      };

      const matches = Object.entries(patterns).reduce((acc, [key, pattern]) => {
        acc[key] = (text.match(pattern) || []).length;
        return acc;
      }, {});

      return {
        networkScore: matches.multipleViews * 2 + matches.groupPerspectives + matches.powerRelations,
        dialogueScore: this.getSentenceComplexity(text).filter(s => s.parenthetical > 0).length
      };
    },

    // Analyze material implications
    getMaterialAnalysis(text) {
      const patterns = {
        economic: /\b(economic|financial|cost|budget|money|fund|resource)\b/iu,
        material: /\b(material|physical|concrete|tangible|infrastructure)\b/iu,
        practical: /\b(implement|practice|apply|use|effect|impact|result)\b/iu
      };

      const matches = Object.entries(patterns).reduce((acc, [key, pattern]) => {
        acc[key] = (text.match(pattern) || []).length;
        return acc;
      }, {});

      return {
        resourceScore: matches.economic * 2 + matches.material,
        practicalScore: matches.practical + this.getNumericalContent(text).numbers
      };
    },

    // Analyze symbolic synthesis
    getSymbolicSynthesis(text) {
      const citations = this.getCitationLevel(text);
      const complexity = this.getSentenceComplexity(text);
      
      return {
        authorityScore: citations.academic * 3 + citations.references * 2 + citations.quotes,
        legitimacyScore: complexity.filter(s => s.complexity > 20).length
      };
    },

    // Language-agnostic citation patterns
    getCitationLevel(text) {
      return {
        academic: (text.match(/[\(\[\{][\p{L}\s]+,?\s*\d{4}[\)\]\}]/gu) || []).length,
        quotes: (text.match(/[""''«»『』「」""]/gu) || []).length / 2,
        references: (text.match(/[\(\[\{][^\)\]\}]+[\)\]\}]/gu) || []).length
      };
    },

    // Analyze numerical content
    getNumericalContent(text) {
      return {
        numbers: (text.match(/\d+(?:\.\d+)?/g) || []).length,
        percentages: (text.match(/\d+(?:\.\d+)?%/g) || []).length,
        dates: (text.match(/\d{4}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/g) || []).length
      };
    }
  };

  const criteria = {
    informationImpact: {
      weight: 0.30,
      socialSignificance: {
        weight: 0.20,
        analyze: (text) => textAnalysis.getImpactLevel(text)
      },
      temporalRelevance: {
        weight: 0.10,
        analyze: (text) => textAnalysis.getTemporalRelevance(text)
      }
    },
    dialecticalCapital: {
      weight: 0.10,
      questionQuality: {
        weight: 0.05,
        analyze: (text) => {
          const quality = textAnalysis.getDialecticalQuality(text);
          if (quality.questionScore > 12) return 'A';
          if (quality.questionScore > 8) return 'B';
          if (quality.questionScore > 5) return 'C';
          if (quality.questionScore > 3) return 'D';
          return 'E';
        }
      },
      argumentStructure: {
        weight: 0.05,
        analyze: (text) => {
          const quality = textAnalysis.getDialecticalQuality(text);
          if (quality.argumentScore > 5) return 'A';
          if (quality.argumentScore > 3) return 'B';
          if (quality.argumentScore > 2) return 'C';
          if (quality.argumentScore > 1) return 'D';
          return 'E';
        }
      }
    },
    socialReasoning: {
      weight: 0.20,
      networkAnalysis: {
        weight: 0.12,
        analyze: (text) => {
          const reasoning = textAnalysis.getSocialReasoning(text);
          if (reasoning.networkScore > 15) return 'A';
          if (reasoning.networkScore > 10) return 'B';
          if (reasoning.networkScore > 7) return 'C';
          if (reasoning.networkScore > 4) return 'D';
          return 'E';
        }
      },
      dialogueQuality: {
        weight: 0.08,
        analyze: (text) => {
          const reasoning = textAnalysis.getSocialReasoning(text);
          if (reasoning.dialogueScore > 8) return 'A';
          if (reasoning.dialogueScore > 6) return 'B';
          if (reasoning.dialogueScore > 4) return 'C';
          if (reasoning.dialogueScore > 2) return 'D';
          return 'E';
        }
      }
    },
    materialAnalysis: {
      weight: 0.15,
      resourceRecognition: {
        weight: 0.08,
        analyze: (text) => {
          const material = textAnalysis.getMaterialAnalysis(text);
          if (material.resourceScore > 10) return 'A';
          if (material.resourceScore > 7) return 'B';
          if (material.resourceScore > 5) return 'C';
          if (material.resourceScore > 3) return 'D';
          return 'E';
        }
      },
      practicalImplications: {
        weight: 0.07,
        analyze: (text) => {
          const material = textAnalysis.getMaterialAnalysis(text);
          if (material.practicalScore > 12) return 'A';
          if (material.practicalScore > 8) return 'B';
          if (material.practicalScore > 5) return 'C';
          if (material.practicalScore > 3) return 'D';
          return 'E';
        }
      }
    },
    symbolicSynthesis: {
      weight: 0.25,
      authorityHandling: {
        weight: 0.15,
        analyze: (text) => {
          const synthesis = textAnalysis.getSymbolicSynthesis(text);
          if (synthesis.authorityScore > 15) return 'A';
          if (synthesis.authorityScore > 10) return 'B';
          if (synthesis.authorityScore > 7) return 'C';
          if (synthesis.authorityScore > 4) return 'D';
          return 'E';
        }
      },
      conclusionLegitimacy: {
        weight: 0.10,
        analyze: (text) => {
          const synthesis = textAnalysis.getSymbolicSynthesis(text);
          if (synthesis.legitimacyScore > 5) return 'A';
          if (synthesis.legitimacyScore > 3) return 'B';
          if (synthesis.legitimacyScore > 2) return 'C';
          if (synthesis.legitimacyScore > 1) return 'D';
          return 'E';
        }
      }
    }
  };

  // Calculate scores
  const scores = {};
  let finalScore = 0;

  for (const [categoryName, category] of Object.entries(criteria)) {
    scores[categoryName] = {
      subScores: {},
      total: 0
    };

    for (const [subCategoryName, subCategory] of Object.entries(category)) {
      if (subCategory.analyze) {
        const grade = subCategory.analyze(text);
        const points = gradeToPoints[grade];
        scores[categoryName].subScores[subCategoryName] = {
          grade,
          points,
          weightedScore: points * subCategory.weight
        };
        scores[categoryName].total += points * subCategory.weight;
      }
    }

    finalScore += scores[categoryName].total * category.weight;
  }

  // Convert to 100-point scale and assign grade
  finalScore = finalScore * 20;
  let finalGrade;
  if (finalScore >= 85) finalGrade = 'A';      // Exceptional analysis
  else if (finalScore >= 75) finalGrade = 'B';  // Strong analysis
  else if (finalScore >= 65) finalGrade = 'C';  // Standard analysis
  else if (finalScore >= 50) finalGrade = 'D';  // Basic analysis
  else finalGrade = 'E';                        // Poor analysis

  return {
    categoryScores: scores,
    finalScore: Math.round(finalScore),
    finalGrade,
    textStats: {
      wordStats: textAnalysis.getWordStats(text),
      sentenceComplexity: textAnalysis.getSentenceComplexity(text),
      citations: textAnalysis.getCitationLevel(text),
      impact: textAnalysis.getImpactLevel(text),
      temporal: textAnalysis.getTemporalRelevance(text),
      dialectical: textAnalysis.getDialecticalQuality(text),
      social: textAnalysis.getSocialReasoning(text),
      material: textAnalysis.getMaterialAnalysis(text),
      symbolic: textAnalysis.getSymbolicSynthesis(text)
    }
  };
}

function displayDetailedAnalysis(results) {
  console.log("=== Detailed Text Analysis ===");
  
  console.log("\n📊 Word Statistics:");
  console.log(`Total words: ${results.textStats.wordStats.total}`);
  console.log(`Unique words: ${results.textStats.wordStats.unique}`);
  console.log(`Vocabulary diversity: ${(results.textStats.wordStats.ratio * 100).toFixed(2)}%`);

  console.log("\n📝 Sentence Analysis:");
  const avgComplexity = results.textStats.sentenceComplexity.reduce((sum, s) => sum + s.complexity, 0) / 
                       results.textStats.sentenceComplexity.length;
  console.log(`Average sentence complexity: ${avgComplexity.toFixed(2)}`);
  console.log(`Number of sentences: ${results.textStats.sentenceComplexity.length}`);

  console.log("\n📚 Citation Analysis:");
  console.log(`Academic citations: ${results.textStats.citations.academic}`);
  console.log(`Quotes: ${results.textStats.citations.quotes}`);
  console.log(`References: ${results.textStats.citations.references}`);

  console.log("\n🔍 Argument Structure:");
  console.log(`Premises: ${results.textStats.dialectical.questionScore}`);
  console.log(`Conclusions: ${results.textStats.dialectical.argumentScore}`);

  console.log("\n🏆 Category Scores:");
  for (const [category, data] of Object.entries(results.categoryScores)) {
    console.log(`\n${category}:`);
    for (const [subCategory, subData] of Object.entries(data.subScores)) {
      console.log(`  ${subCategory}: ${subData.grade} (${subData.points}/5)`);
    }
  }

  console.log("\n📈 Final Results:");
  console.log(`Score: ${results.finalScore}/100`);
  console.log(`Grade: ${results.finalGrade}`);
}

const testText = `En s'opposant au retour de la retraite à 62 ans, «François Bayrou a trahi les Français», cingle Olivier Faure...`; 
const results = analyzeText(testText);
displayDetailedAnalysis(results);

function getGradeColor(grade) {
  switch(grade) {
    case 'A': return '#4CAF50';  
    case 'B': return '#FFC107';  
    case 'C': return '#FF9800';  
    case 'D': return '#F44336';  
    default: return '#757575';   
  }
}

function highlightText(results) {
  const existingHighlights = document.querySelectorAll('.text-analysis-highlight');
  existingHighlights.forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
  });

  if (!results) return;

  const gradeValues = Object.values(results.categoryScores).map(category => category.total);
  const averageGrade = gradeValues.sort()[Math.floor(gradeValues.length / 2)]; 
  const color = getGradeColor(averageGrade > 3 ? 'A' : averageGrade > 2 ? 'B' : averageGrade > 1 ? 'C' : averageGrade > 0 ? 'D' : 'E');

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        const parent = node.parentNode;
        if (parent.tagName === 'SCRIPT' || 
            parent.tagName === 'STYLE' || 
            parent.classList.contains('text-analysis-highlight') ||
            parent.id === 'text-analysis-popup') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }

  textNodes.forEach(node => {
    if (node.textContent.trim()) {
      const span = document.createElement('span');
      span.className = 'text-analysis-highlight';
      span.style.backgroundColor = `${color}22`; 
      span.style.transition = 'background-color 0.3s';
      span.textContent = node.textContent;
      node.parentNode.replaceChild(span, node);
    }
  });
}

function displayResults(results) {
  const existingPopup = document.getElementById('text-analysis-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  const popup = document.createElement("div");
  popup.id = 'text-analysis-popup';
  popup.style.position = "fixed";
  popup.style.top = "10px";
  popup.style.right = "10px";
  popup.style.backgroundColor = "white";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "15px";
  popup.style.zIndex = "10000";
  popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  popup.style.borderRadius = "8px";
  popup.style.maxWidth = "300px";
  popup.style.fontSize = "14px";

  const title = document.createElement("h3");
  title.textContent = "Text Analysis Results";
  title.style.margin = "0 0 10px 0";
  title.style.fontSize = "16px";
  popup.appendChild(title);

  for (const [category, data] of Object.entries(results.categoryScores)) {
    const p = document.createElement("p");
    p.style.margin = "5px 0";
    const grade = Object.values(data.subScores).sort((a, b) => b.points - a.points)[0].grade;
    const color = getGradeColor(grade);
    
    p.innerHTML = `<strong>${category}:</strong> <span style="color: ${color}; font-weight: bold">${grade}</span>`;
    popup.appendChild(p);
  }

  const finalScoreP = document.createElement("p");
  finalScoreP.style.margin = "5px 0";
  finalScoreP.innerHTML = `<strong>Final Score:</strong> <span style="font-weight: bold">${results.finalScore}</span>`;
  popup.appendChild(finalScoreP);

  const finalGradeP = document.createElement("p");
  finalGradeP.style.margin = "5px 0";
  finalGradeP.innerHTML = `<strong>Final Grade:</strong> <span style="font-weight: bold">${results.finalGrade}</span>`;
  popup.appendChild(finalGradeP);

  document.body.appendChild(popup);
}

function removeAnalysis() {
  const popup = document.getElementById('text-analysis-popup');
  if (popup) {
    popup.remove();
  }

  const highlights = document.querySelectorAll('.text-analysis-highlight');
  highlights.forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "ping") {
    sendResponse({status: "ok"});
    return;
  }
  
  if (request.action === "toggleAnalysis") {
    if (request.enabled) {
      const mainContent = document.querySelector('article') || document.body;
      const text = mainContent.innerText;
      const results = analyzeText(text);
      displayResults(results);
      highlightText(results);
    } else {
      removeAnalysis();
    }
  }
  sendResponse({status: "ok"});
});

chrome.storage.local.get(['analysisEnabled'], function(result) {
  if (result.analysisEnabled) {
    const mainContent = document.querySelector('article') || document.body;
    const text = mainContent.innerText;
    const results = analyzeText(text);
    displayResults(results);
    highlightText(results);
  }
});