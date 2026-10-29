import React from 'react';
import {
  Flame,
  Shield,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  Users,
  Compass,
} from 'lucide-react';
import { TempleInfo } from '../types';

interface AboutPageProps {
  templeInfo: TempleInfo | null;
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ templeInfo, onNavigate }) => {
  const deities = [
    {
      name: 'Sri Maha Mariamman (Moolavar)',
      role: 'Presiding Supreme Deity (Shakti Swaroopini)',
      description:
        'The supreme manifestation of Parashakti. Consecrated as a self-manifested Swayambhu rock lingam adorned with exquisite silver kavacham, divine Trishulam, and gold crown. Devotees offer turmeric, neem leaves, and sacred milk for health, family wellness, and rain.',
      icon: '🌺',
    },
    {
      name: 'Sri Selva Vinayagar',
      role: 'Lord of Auspicious Beginnings',
      description:
        'Situated at the South-West praharam. Worshipped with modakam, arugampul grass, and coconut breaking before commencing all temple celebrations and personal milestones.',
      icon: '🐘',
    },
    {
      name: 'Sri Subramaniar (Murugan) with Valli & Deivanai',
      role: 'Divine Commander & Bestower of Wisdom',
      description:
        'Adorned in celestial warrior alankaram with golden Vel. Special Panchamirtham abhishekam is performed on Sashti and Krithigai star days.',
      icon: '🦚',
    },
    {
      name: 'Sri Durga Devi (Vanquisher of Mahishasura)',
      role: 'Goddess of Supreme Victory & Protection',
      description:
        'Conducted during Tuesday and Friday Rahu Kalam. Devotees light 108 lemon peel ghee lamps to dispel severe planetary afflictions and negative forces.',
      icon: '🪔',
    },
    {
      name: 'Sri Navagraha Sannadhi',
      role: 'Nine Celestial Cosmic Guardians',
      description:
        'Arranged strictly in astrological Agamic alignment on a lotus stone pedestal. Specific grains (Navadhanyam) and colored vastrams are offered for planetary peace.',
      icon: '🪐',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Heritage & Consecration
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white">
            About {templeInfo?.name || 'Sri Amman Temple'}
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Discover the 300-year sacred history, the presiding deities, the Dravidian architectural
            marvel, and the spiritual traditions that have guided generations of devotees.
          </p>
        </div>
      </section>

      {/* Sthala Puranam Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Sacred Origins
            </span>
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-slate-900">
              The Legend & Sthala Puranam
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {templeInfo?.history ||
                'Sri Amman Temple is an ancient sanctuary with a sacred heritage spanning over 300 years. According to local sthala puranam, a divine self-manifested (Swayambhu) trident was discovered at this consecrated site by revered temple elders.'}
            </p>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              During a severe drought in the 18th century, the local populace prayed fervently before
              the sacred Neem tree at this spot. Following an apparitional vision granted to a saintly
              elder, consecrated turmeric water was poured upon the earth, and torrential rains
              instantly blessed the scorched soil. A grand temple sanctum was erected in honor of
              Goddess Mariamman, who came to be revered as the compassionate Mother of healing and
              abundance.
            </p>
          </div>

          {/* Core Values grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
              <Award className="w-6 h-6 text-purple-900" />
              <h3 className="font-cinzel text-base font-bold text-purple-950">
                Agamic Authenticity
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rituals conducted strictly adhering to ancient Saiva & Shakta Agama Shastras by
                trained Sivachariyars.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
              <Sparkles className="w-6 h-6 text-amber-700" />
              <h3 className="font-cinzel text-base font-bold text-amber-950">
                Spiritual Healing
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Venerated as a premier healing shrine where prayers for family health and alleviation of
                illnesses are answered.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <Users className="w-6 h-6 text-indigo-900" />
              <h3 className="font-cinzel text-base font-bold text-indigo-950">
                Community Annadhanam
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Serving free, wholesome satvik meals to visiting pilgrims and seekers every single
                day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Sanctum Sanctorum
          </span>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-slate-900">
            Presiding & Parivara Deities
          </h2>
          <p className="text-sm text-slate-600">
            Each shrine within the sacred temple complex is energized through centuries of mantra
            japa and devotion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deities.map((deity, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-purple-50 border border-purple-100">
                  {deity.icon}
                </span>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-slate-900 leading-snug">
                    {deity.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-purple-800">
                    {deity.role}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {deity.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture & Traditions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Dravidian Architecture
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-slate-900">
              The 145-Foot Majestic Rajagopuram
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              The temple's magnificent 11-tier Rajagopuram stands proudly over Mylapore, featuring
              thousands of masterfully sculpted Agamic figures depicting the leelas of Shakti and
              Shiva. The inner sanctum (Garbhagriha) is constructed of sacred black granite
              (Karungallu) that retains spiritual vibrations.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-900" />
                <span>Sacred Temple Complex Features:</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Swarna Dwajasthambam (Gold-plated Flagstaff).</li>
                <li>Pavitra Teertham (Sacred Spring Pond for ritual purification).</li>
                <li>Centuries-old Sthala Vriksham (Sacred Margosa / Neem Tree).</li>
                <li>Yagasala for Chandi Homam and Veda Parayanam.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-lg border border-purple-100">
            <img
              src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80"
              alt="Temple Architecture"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Code of Conduct for Devotees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-purple-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-amber-400/40 space-y-4">
          <div className="flex items-center gap-2 text-amber-300">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-xl font-bold">Pilgrim Code of Conduct & Dress Code</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To preserve the sanctity and Agamic sanctity of the temple premises, all devotees are kindly
            requested to comply with the following traditional rules:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="font-bold text-amber-300 mb-1">Traditional Attire</p>
              <p>Men: Dhoti with Angavastram or Kurta-Pyjama. Women: Saree, Half-Saree or Churidar.</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="font-bold text-amber-300 mb-1">Photography Policy</p>
              <p>Photography & videography inside the inner Sanctum Sanctorum (Moolavar) are strictly prohibited.</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="font-bold text-amber-300 mb-1">Footwear & Cleanliness</p>
              <p>Please leave footwear at the designated temple counters before stepping into the outer praharam.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
