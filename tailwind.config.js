/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: ['./src/**/*.{html,js,jsx,ts,tsx,css}'],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		 fontSize: {
              // fluid font sizes: clamp(min, preferred, max)
              'fluid-xs':  'clamp(.75rem, 1.2vw, .875rem)',   // small captions
              'fluid-sm':  'clamp(.875rem, 1.4vw, 1rem)',     // body small
              'fluid-base': 'clamp(1rem, 1.6vw, 1.125rem)',   // body default
              'fluid-lg':  'clamp(1.125rem, 2.2vw, 1.375rem)',// subtitle
              'fluid-xl':  'clamp(1.5rem, 3vw, 2rem)',        // heading
              'fluid-2xl': 'clamp(2rem, 4vw, 3rem)'          // large hero
          },
          maxWidth: {
              'content': '56rem',  // ~896px for wide containers
              'reading': '40rem'   // ~640px, good for prose and Q/A cards
          },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
      borderColor: {
        border: 'hsl(var(--border))', // 👈 this is the important one
      }
  	}
  },
  plugins: [],
};
