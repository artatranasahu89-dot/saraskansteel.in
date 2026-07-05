import { useEffect, useState } from "react";
import axios from "axios";

function OfferCarousel() {
  const [offers, setOffers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  const loadOffers = async () => {
    const res = await axios.get("https://saraskansteel-in.onrender.com/api/offers/active");
    setOffers(res.data.data || []);
  };

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    if (offers.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % offers.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [offers.length]);

  if (offers.length === 0) return null;

  const offer = offers[index];

  return (
    <>
      <style>{`
        .offer-box{
          background:${offer.backgroundColor || "#2563eb"};
          color:white;
          border-radius:24px;
          padding:24px;
          margin-bottom:22px;
          display:grid;
          grid-template-columns:1.2fr 1fr;
          gap:20px;
          align-items:center;
          box-shadow:0 12px 35px rgba(0,0,0,.18);
          overflow:hidden;
        }

        .offer-box h2{
          margin:0;
          font-size:30px;
        }

        .offer-box h4{
          margin:0 0 8px;
          opacity:.9;
        }

        .offer-box p{
          color:#e5e7eb;
          line-height:1.5;
        }

        .offer-img{
          height:190px;
          border-radius:20px;
          background:rgba(255,255,255,.15);
          overflow:hidden;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:60px;
        }

        .offer-img img{
          width:100%;
          height:100%;
          object-fit:cover;
        }

        .offer-btn{
          display:inline-block;
          background:white;
          color:#111827;
          text-decoration:none;
          padding:11px 16px;
          border-radius:12px;
          font-weight:1000;
          margin-top:8px;
        }

        .dots{
          display:flex;
          gap:7px;
          margin-top:14px;
        }

        .dot{
          width:9px;
          height:9px;
          border-radius:50%;
          background:rgba(255,255,255,.45);
          border:none;
          cursor:pointer;
        }

        .dot.active{
          background:white;
        }

        @media(max-width:700px){
          .offer-box{
            grid-template-columns:1fr;
          }

          .offer-box h2{
            font-size:24px;
          }

          .offer-img{
            height:160px;
          }
        }
      `}</style>

      <div className="offer-box">
        <div>
          <h4>{offer.subtitle || "Special Offer"}</h4>
          <h2>{offer.title}</h2>
          <p>{offer.description}</p>

          {offer.buttonText && offer.buttonLink && (
            <a className="offer-btn" href={offer.buttonLink}>
              {offer.buttonText}
            </a>
          )}

          <div className="dots">
            {offers.map((_, i) => (
              <button
                key={i}
                className={i === index ? "dot active" : "dot"}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </div>

        <div className="offer-img">
          {offer.imageUrl ? <img src={offer.imageUrl} /> : "🎉"}
        </div>
      </div>
    </>
  );
}

export default OfferCarousel;