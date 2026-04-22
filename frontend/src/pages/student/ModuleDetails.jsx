import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import "../../styles/modules.css";

export default function ModuleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [moduleData, setModuleData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicStatusMap, setTopicStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const moduleContent = {
    1: {
      title: "🟢 मोड्युल १ – व्यक्तिगत साइबर सुरक्षा (Personal Cyber Protection)",
      intro: `यो मोड्युलमा प्रयोगकर्ताले आफ्नो व्यक्तिगत अनलाइन खाता, पासवर्ड, र डिजिटल पहिचानलाई कसरी सुरक्षित राख्ने भन्ने कुरा सिक्छन्। आजको समयमा फेसबुक, इमेल, अनलाइन बैंकिङ, eSewa, Khalti, र अन्य धेरै एप तथा वेबसाइटहरू दैनिक जीवनको हिस्सा बनिसकेका छन्। यदि यी खाताहरू सुरक्षित भएनन् भने ह्याकरहरूले जानकारी चोरी गर्न, खाता ह्याक गर्न, वा आर्थिक नोक्सानी पुर्‍याउन सक्छन्।`,
      points: [
        "पासवर्ड सुरक्षा, २-फ्याक्टर प्रमाणीकरण (2FA), र डिजिटल पहिचान सुरक्षाका मुख्य विषयहरू समावेश छन्।",
        "प्रयोगकर्ताले बलियो पासवर्ड कसरी बनाउने, एउटै पासवर्ड धेरै ठाउँमा प्रयोग गर्दा किन जोखिम हुन्छ, र 2FA ले खातामा कसरी अतिरिक्त सुरक्षा थप्छ भन्ने कुरा सिक्छन्।",
        "सामाजिक सञ्जाल, इमेल, र अन्य अनलाइन सेवामा आफ्नो व्यक्तिगत जानकारी सोचेर मात्र साझा गर्नुपर्ने महत्त्व पनि बुझ्छन्।"
      ],
      closing: `यो मोड्युल पूरा गरेपछि प्रयोगकर्ताले आफ्नो व्यक्तिगत डिजिटल सुरक्षामा आधारभूत तर अत्यन्त महत्वपूर्ण सावधानी अपनाउन सक्नेछन्। यसले उनीहरूलाई आफ्नो खाता, जानकारी, र अनलाइन पहिचानलाई सुरक्षित राख्न मद्दत गर्नेछ।`
    },

    2: {
      title: "🟡 मोड्युल २ – अनलाइन खतरा सचेतना (Online Threat Awareness)",
      intro: `यो मोड्युलमा प्रयोगकर्ताले इन्टरनेटमा हुने विभिन्न ठगी, नक्कली सन्देश, र शंकास्पद वेबसाइट वा एपहरू कसरी चिन्ने र त्यसबाट कसरी बच्ने भन्ने कुरा सिक्छन्। आज धेरै साइबर आक्रमणहरू मानिसलाई झुक्याएर गरिन्छ, जस्तै नक्कली इमेल, फिसिङ लिंक, QR कोड स्क्याम, वा वास्तविक जस्तै देखिने नक्कली वेबसाइटहरू। यस्ता जोखिमहरू नचिनिएमा व्यक्तिगत जानकारी, पासवर्ड, वा पैसा गुम्ने सम्भावना हुन्छ।`,
      points: [
        "यस मोड्युलमा फिसिङ (Phishing), QR कोड स्क्याम सचेतना, र सुरक्षित वेबसाइट तथा एप पहिचान जस्ता विषयहरू समावेश छन्।",
        "प्रयोगकर्ताले शंकास्पद सन्देशमा तुरुन्त विश्वास नगर्ने, लिंक क्लिक गर्नु अघि सोच्ने, QR कोड स्क्यान गर्दा सावधानी अपनाउने, र वेबसाइट वा एप वास्तविक हो कि होइन भनेर कसरी जाँच गर्ने भन्ने कुरा सिक्छन्।",
        "यसले अनलाइनमा देखिने हरेक कुरा सुरक्षित नहुन सक्छ भन्ने बुझाइ दिन्छ र सुरक्षित निर्णय लिन मद्दत गर्छ।"
      ],
      closing: `यो मोड्युल पूरा गरेपछि प्रयोगकर्ताले डिजिटल ठगीका सामान्य संकेतहरू चिन्न, अनलाइन जोखिमलाई समयमै बुझ्न, र आफूलाई सुरक्षित राख्ने व्यवहार अपनाउन सक्नेछन्।`
    },

    3: {
      title: "🔵 मोड्युल ३ – सामाजिक तथा व्यवहारिक सुरक्षा (Social & Behavioral Security)",
      intro: `यो मोड्युलमा प्रयोगकर्ताले इन्टरनेट र डिजिटल उपकरण प्रयोग गर्दा सही व्यवहार, जिम्मेवारी, र सामाजिक सुरक्षाको बारेमा सिक्छन्। साइबर सुरक्षा केवल पासवर्ड र वेबसाइटको विषय मात्र होइन, हाम्रो व्यवहार, निर्णय, र अरूसँगको डिजिटल अन्तरक्रियासँग पनि जोडिएको हुन्छ। यदि प्रयोगकर्ताले असावधानीपूर्वक मोबाइल प्रयोग गरे, सामाजिक सञ्जालमा गलत व्यवहार गरे, वा कार्यस्थलमा डिजिटल नियम नमान्ने बानी बसाले भने त्यसले ठूलो जोखिम सिर्जना गर्न सक्छ।`,
      points: [
        "यस मोड्युलमा मोबाइल सुरक्षा, साइबर बुलिइङ सचेतना, र कार्यस्थलमा साइबर सुरक्षा जस्ता विषयहरू समावेश छन्।",
        "प्रयोगकर्ताले आफ्नो मोबाइलमा स्क्रिन लक, सुरक्षित एप प्रयोग, र नियमित अपडेटको महत्त्व बुझ्नेछन्।",
        "साथै साइबर बुलिइङ के हो, त्यसले कसरी असर गर्छ, र कार्यस्थलमा इमेल, फाइल, तथा कम्पनीको डाटा सुरक्षित तरिकाले कसरी प्रयोग गर्ने भन्ने आधारभूत सचेतना पनि पाउनेछन्।"
      ],
      closing: `यो मोड्युल पूरा गरेपछि प्रयोगकर्ताले डिजिटल जीवनमा सुरक्षित, जिम्मेवार, र सम्मानजनक व्यवहार अपनाउने ज्ञान प्राप्त गर्नेछन्। यसले व्यक्तिगत सुरक्षा मात्र होइन, अरू व्यक्तिको सुरक्षा र कार्यस्थलको डिजिटल सुरक्षामा पनि सकारात्मक योगदान पुर्‍याउँछ।`
    }
  };

  useEffect(() => {
    loadModulePage();
  }, [id, location.pathname, location.search]);

  async function loadModulePage() {
    try {
      setLoading(true);

      const moduleRes = await api.get(`/modules/${id}`);
      const currentModule = moduleRes?.data?.data || null;

      if (!currentModule) {
        setModuleData(null);
        setIsUnlocked(false);
        setTopics([]);
        setTopicStatusMap({});
        setLoading(false);
        return;
      }

      setModuleData(currentModule);
      setIsUnlocked(Number(currentModule.is_unlocked) === 1);

      const topicRes = await api.get(`/topics/module/${id}`);
      const topicList = topicRes?.data?.data || [];
      setTopics(Array.isArray(topicList) ? topicList : []);

      const progressResults = await Promise.all(
        topicList.map(async (topic) => {
          try {
            const res = await api.get(`/progress/topic/${topic.id}`);
            return {
              topicId: topic.id,
              progress: res?.data?.data || null,
            };
          } catch (err) {
            console.error(`Topic progress load error for topic ${topic.id}:`, err);
            return {
              topicId: topic.id,
              progress: null,
            };
          }
        })
      );

      const progressMap = {};
      progressResults.forEach(({ topicId, progress }) => {
        progressMap[topicId] = progress;
      });
      setTopicStatusMap(progressMap);
    } catch (err) {
      console.error("Error loading module page:", err);
      setModuleData(null);
      setIsUnlocked(false);
      setTopics([]);
      setTopicStatusMap({});
    } finally {
      setLoading(false);
    }
  }

  function getNextTopic() {
    for (const topic of topics) {
      const progress = topicStatusMap[topic.id];
      if (!progress || Number(progress.completed || 0) !== 1) {
        return topic;
      }
    }
    return topics[0] || null;
  }

  function isTopicAccessible() {
    return isUnlocked;
  }

  const fallback = moduleContent[id];
  const displayTitle = fallback?.title || moduleData?.title || "Module";
  const displayIntro =
    fallback?.intro || moduleData?.description || "No content available";
  const displayPoints = fallback?.points || [];
  const displayClosing = fallback?.closing || "";

  const nextTopic = getNextTopic();

  if (loading) {
    return <div className="mod-detail-loading">Loading module details...</div>;
  }

  if (!moduleData && !fallback) {
    return <div className="mod-detail-loading">Module not found</div>;
  }

  return (
    <div className="mod-detail-page">
      <section className="mod-detail-hero">
        <div className="mod-detail-hero__content">
          <div className="mod-detail-hero__eyebrow">Module Overview</div>
          <h1 className="mod-detail-hero__title">{displayTitle}</h1>
          <p className="mod-detail-hero__subtitle">
            Learn the key concepts of this module before continuing to the topic flow.
          </p>
        </div>
      </section>

      <section className="mod-detail-card">
        <div className="mod-detail-card__section">
          <p className="mod-detail-text">{displayIntro}</p>
        </div>

        {displayPoints.length > 0 && (
          <div className="mod-detail-highlight-box">
            <h3 className="mod-detail-highlight-box__title">
              यस मोड्युलमा समावेश मुख्य विषयहरू
            </h3>

            <ul className="mod-detail-points">
              {displayPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {displayClosing && (
          <div className="mod-detail-card__section">
            <p className="mod-detail-text mod-detail-text--closing">
              {displayClosing}
            </p>
          </div>
        )}

        <div className="mod-detail-actions">
          {!isUnlocked ? (
            <button
              onClick={() => navigate(`/student/quiz/pre-${id}`)}
              className="mod-detail-btn mod-detail-btn--primary"
            >
              Start Pre-Assessment
            </button>
          ) : (
            <button
              onClick={() => {
                if (nextTopic) {
                  navigate(`/student/topic/${nextTopic.id}`);
                }
              }}
              className="mod-detail-btn mod-detail-btn--success"
              disabled={!nextTopic}
            >
              Continue Learning
            </button>
          )}
        </div>
      </section>

      <section className="mod-detail-topics-card">
        <div className="mod-detail-topics-head">
          <h2 className="mod-detail-topics-title">Topics</h2>
          <span className="mod-detail-topics-count">{topics.length}</span>
        </div>

        <div className="mod-detail-topic-list">
          {topics.map((topic) => {
            const progress = topicStatusMap[topic.id];
            const completed = Number(progress?.completed || 0) === 1;
            const accessible = isTopicAccessible();

            let topicClass = "mod-detail-topic-btn";
            if (!accessible) topicClass += " mod-detail-topic-btn--locked";
            else if (completed) topicClass += " mod-detail-topic-btn--completed";
            else topicClass += " mod-detail-topic-btn--pending";

            return (
              <button
                key={topic.id}
                onClick={() => accessible && navigate(`/student/topic/${topic.id}`)}
                disabled={!accessible}
                className={topicClass}
              >
                <span className="mod-detail-topic-btn__left">
                  <span className="mod-detail-topic-btn__icon">
                    {!accessible ? "🔒" : completed ? "✅" : "📘"}
                  </span>
                  <span className="mod-detail-topic-btn__text">{topic.title}</span>
                </span>

                <span className="mod-detail-topic-btn__status">
                  {!accessible
                    ? "Locked"
                    : completed
                    ? "Completed"
                    : "Open Topic"}
                </span>
              </button>
            );
          })}
        </div>

        {!isUnlocked && (
          <p className="mod-detail-lock-note">
            🔒 Complete pre-assessment to unlock topics.
          </p>
        )}
      </section>
    </div>
  );
}