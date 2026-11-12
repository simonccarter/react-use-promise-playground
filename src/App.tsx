import { Suspense, use, useReducer, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createAlbumsPromise, type Album } from "./data/albums";
import { useAlbums } from "./hooks/useAlbums";
import { ErrorBoundary } from "./ErrorBoundary";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4f46e5" },
    background: { default: "#f5f7fb", paper: "#ffffff" },
  },
  shape: { borderRadius: 14 },
  typography: { fontFamily: "Inter, Roboto, Arial, sans-serif" },
});

function AlbumList({ albums }: { albums: Album[] }) {
  return (
    <Stack spacing={1.25} sx={{ mt: 2 }}>
      {albums.map((album) => (
        <Box
          key={album.id}
          sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}
        >
          <Typography sx={{ fontWeight: 700 }}>{album.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {album.artist}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

async function NoUseReader({ promise }: { promise: Promise<Album[]> }) {
  const albums = await promise;
  return <AlbumList albums={albums} />;
}

function DirectReader({ promise }: { promise: Promise<Album[]> }) {
  const albums = use(promise);
  return <AlbumList albums={albums} />;
}

function HookReader({ promise }: { promise: Promise<Album[]> }) {
  const albums = useAlbums(promise);
  return <AlbumList albums={albums} />;
}

function ManualStateCard() {
  const [albums, setAlbums] = useState<Album[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAlbums() {
    setIsLoading(true);
    setAlbums(null);
    setError(null);

    try {
      setAlbums(await createAlbumsPromise());
    } catch (reason) {
      setError(
        reason instanceof Error
          ? `Not Boundary: ${reason.message}`
          : "Could not load albums",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Explicit state (supported)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Await in the click handler, then manage loading, error, and data
            state directly. No Suspense boundary is involved.
          </Typography>
          <Button variant="outlined" onClick={loadAlbums} disabled={isLoading}>
            Load with state
          </Button>
          {isLoading && <PendingMessage />}
          {error && <Alert severity="error">{error}</Alert>}
          {albums && <AlbumList albums={albums} />}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PendingMessage() {
  return (
    <Stack direction="row" spacing={1.5} sx={{ py: 3, alignItems: "center" }}>
      <CircularProgress size={20} />
      <Typography color="text.secondary">Waiting for the promise…</Typography>
    </Stack>
  );
}

function App() {
  const [promise, setPromise] = useState<Promise<Album[]> | null>(null);
  const [directPromise, setDirectPromise] = useState<Promise<Album[]> | null>(
    null,
  );
  const [wrappedPromise, setWrappedPromise] = useState<Promise<Album[]> | null>(
    null,
  );
  const [attempts, incrementAttempt] = useReducer(
    (
      state: Record<"async" | "direct" | "wrapped", number>,
      reader: "async" | "direct" | "wrapped",
    ) => ({ ...state, [reader]: state[reader] + 1 }),
    { async: 0, direct: 0, wrapped: 0 },
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="overline"
              color="primary.main"
              sx={{ fontWeight: 800 }}
            >
              React 19 playground
            </Typography>
            <Typography
              variant="h3"
              variantMapping={{ h3: "h1" }}
              sx={{ fontWeight: 800 }}
            >
              Reading a promise with <code>use</code>
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
              Compare calling React&apos;s <code>use(promise)</code> directly
              with hiding that detail behind a domain-specific hook.
            </Typography>
          </Box>

          <Alert severity="info">
            Each button creates a promise in an event handler and saves it in
            state. The result component reads it during render. While it is
            pending, Suspense shows the fallback below.
          </Alert>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
                xl: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Async component (unsupported)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This async Client Component can appear to suspend, but React
                    does not support async Client Components. Use the explicit
                    state card for the supported no-use pattern.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      incrementAttempt("async");
                      setPromise(createAlbumsPromise());
                    }}
                  >
                    Load async component
                  </Button>
                  <ErrorBoundary key={attempts.async}>
                    {promise && (
                      <Suspense fallback={<PendingMessage />}>
                        <NoUseReader promise={promise} />
                      </Suspense>
                    )}
                  </ErrorBoundary>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Direct `use`
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The component that receives the promise must remember to
                    unwrap it with React&apos;s `use` API.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      incrementAttempt("direct");
                      setDirectPromise(createAlbumsPromise());
                    }}
                  >
                    Load with use
                  </Button>
                  <ErrorBoundary key={attempts.direct}>
                    {directPromise && (
                      <Suspense fallback={<PendingMessage />}>
                        <DirectReader promise={directPromise} />
                      </Suspense>
                    )}
                  </ErrorBoundary>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Domain hook wrapper
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The component asks for albums. `useAlbums` owns the promise
                    unwrapping, so callers don&apos;t need to remember it.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      incrementAttempt("wrapped");
                      setWrappedPromise(createAlbumsPromise());
                    }}
                  >
                    Load through useAlbums
                  </Button>
                  <ErrorBoundary key={attempts.wrapped}>
                    {wrappedPromise && (
                      <Suspense fallback={<PendingMessage />}>
                        <HookReader promise={wrappedPromise} />
                      </Suspense>
                    )}
                  </ErrorBoundary>
                </Stack>
              </CardContent>
            </Card>

            <ErrorBoundary>
              <ManualStateCard />
            </ErrorBoundary>
          </Box>

          <Alert severity="warning">
            The wrapper only makes the unwrapping convention harder to forget.
            It does not create or cache promises, and it still needs a Suspense
            boundary. Don&apos;t create a new promise directly during render.
          </Alert>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export default App;
