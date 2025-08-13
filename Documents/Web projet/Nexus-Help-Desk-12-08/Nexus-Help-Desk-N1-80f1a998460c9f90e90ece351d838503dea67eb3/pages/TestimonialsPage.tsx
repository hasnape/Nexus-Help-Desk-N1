import React from "react";

const testimonials = [
  {
    name: "Sophie L.",
    text: "Un support client réactif et une interface très agréable !",
    company: "Entreprise Alpha",
  },
  {
    name: "Karim B.",
    text: "La gestion des tickets est simple et efficace. Je recommande.",
    company: "Beta Solutions",
  },
];

const TestimonialsPage: React.FC = () => (
  <div className="container mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-8">Témoignages</h1>
    <div className="grid md:grid-cols-2 gap-8">
      {testimonials.map((t, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <p className="text-lg italic mb-2">“{t.text}”</p>
          <div className="text-sky-600 font-semibold">{t.name}</div>
          <div className="text-slate-400 text-sm">{t.company}</div>
        </div>
      ))}
    </div>
  </div>
);

export default TestimonialsPage;
