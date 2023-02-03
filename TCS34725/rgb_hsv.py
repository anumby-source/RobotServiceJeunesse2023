def rgb_hue(rgb, s=1):
  nrgb = rgb.astype(np.float64) / float(s)
  nmax = np.max(nrgb,1)
  ndelta = nmax - np.min(nrgb,1)
  return (np.where(ndelta == 0, 0
      , np.where(nmax == nrgb[:,0], nrgb[:,1]-nrgb[:,2]
      , np.where(nmax == nrgb[:,1], (nrgb[:,2]-nrgb[:,0])+2
      , (nrgb[:,0]-nrgb[:,1])+4))) / 6.) % 1.

def rgb_saturation(rgb, s=1):
  nrgb = rgb.astype(np.float64) / float(s)
  nmax = np.max(nrgb,1)
  ndelta = nmax - np.min(nrgb,1)
  return np.where(nmax == 0, 0, ndelta / nmax)

def rgb_value(rgb, s=1):
  nrgb = rgb.astype(np.float64) / float(s)
  nmax = np.max(nrgb,1)
  return nmax

def rgb_hsv(rgb, s=1, dhue=1, dsat=1, dval=1):
  nrgb = rgb.astype(np.float64) / float(s)
  nmax = np.max(nrgb,1)
  ndelta = nmax - np.min(nrgb,1)
  hue = (np.where(ndelta == 0, 0
      , np.where(nmax == nrgb[:,0], nrgb[:,1]-nrgb[:,2]
      , np.where(nmax == nrgb[:,1], (nrgb[:,2]-nrgb[:,0])+2
      , (nrgb[:,0]-nrgb[:,1])+4))) / 6.) % 1.
  sat = np.where(nmax == 0, 0, ndelta / nmax)
  val = nmax
  return np.column_stack((hue*dhue, sat*dsat, val*dval))


