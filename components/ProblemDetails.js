import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

export default function ProblemDetails({ data }) {
  const renderText = (text) => {
    if (!text) return '';
    
    // Split text into sections by double newlines
    const sections = text.split('\n\n');
    
    return sections.map((section, sectionIdx) => {
      // Handle different section types
      if (section.startsWith('**') && section.includes(':**')) {
        // Section headers (e.g., "**Test Cases:**")
        const [header, ...content] = section.split(':**');
        return (
          <div key={sectionIdx} className="section">
            <h3>{header.replace(/\*\*/g, '')}</h3>
            <div className="content">{renderContent(content.join(':**'))}</div>
          </div>
        );
      }
      
      return <div key={sectionIdx} className="section">{renderContent(section)}</div>;
    });
  };

  const renderContent = (content) => {
    // Split by bullet points
    const points = content.split('\n- ');
    
    return points.map((point, idx) => {
      if (idx === 0 && !point.startsWith('-')) {
        return renderParagraph(point, idx);
      }
      return <li key={idx}>{renderParagraph(point, idx)}</li>;
    });
  };

  const renderParagraph = (text, key) => {
    // Handle LaTeX and bold text
    const parts = text.split(/(\$.*?\$|\*\*.*?\*\*)/g);
    
    return (
      <p key={key}>
        {parts.map((part, idx) => {
          if (part.startsWith('$') && part.endsWith('$')) {
            return <InlineMath key={idx} math={part.slice(1, -1)} />;
          }
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <div className="problem-container">
      <h1 className="problem-title">{data.title}</h1>
      <div className="problem-section">
        <h2>Problem Statement</h2>
        <div className="content">{renderText(data.statement)}</div>
      </div>
      <div className="problem-section">
        <h2>Input</h2>
        <div className="content">{renderText(data.inputSpec)}</div>
      </div>
      <div className="problem-section">
        <h2>Output</h2>
        <div className="content">{renderText(data.outputSpec)}</div>
      </div>
      <div className="problem-section">
        <h2>Sample Inputs</h2>
        {data.sampleInputs && data.sampleInputs.map((input, index) => (
          <pre key={index}>{renderText(input)}</pre>
        ))}
      </div>
      <div className="problem-section">
        <h2>Sample Outputs</h2>
        {data.sampleOutputs && data.sampleOutputs.map((output, index) => (
          <pre key={index}>{renderText(output)}</pre>
        ))}
      </div>
      {data.note && (
        <div className="problem-section">
          <h2>Note</h2>
          <div className="content">{renderText(data.note)}</div>
        </div>
      )}
      {data.images && data.images.length > 0 && (
        <div className="problem-section">
          <h2>Images</h2>
          {data.images.map((image, index) => (
            <img key={index} src={`/images/${image}`} alt={`Problem Image ${index + 1}`} />
          ))}
        </div>
      )}
      <style jsx>{`
        .problem-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        .problem-title {
          color: #2c3e50;
          border-bottom: 2px solid #eee;
          padding-bottom: 10px;
        }
        .problem-section {
          margin: 20px 0;
        }
        .content {
          line-height: 1.6;
        }
        .content li {
          margin: 10px 0;
        }
        .section {
          margin: 1.5em 0;
        }
        .section h3 {
          color: #2c3e50;
          font-size: 1.2em;
          margin-bottom: 0.5em;
        }
        strong {
          color: #34495e;
        }
        pre {
          background: #f8f9fa;
          padding: 1em;
          border-radius: 4px;
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}
